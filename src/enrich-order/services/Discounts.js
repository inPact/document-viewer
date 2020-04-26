window.DocumentViewer.DiscountsService = (function () {

    let translateService;
    let userService;
    let utils;

    const DiscountTypes = {
        OTH: "OTH",
        AMOUNT_OFF: "AmountOff",
        PERCENT_OFF: "PercentOff"
    };

    function DiscountsService(options) {

        translateService = new window.DocumentViewer.EnrichOrderTranslateService({
            local: options.local
        });

        userService = new window.DocumentViewer.UserService();

        utils = new window.DocumentViewer.Utils();
    }

    function resolveDiscounts(order) {

        let result = [];
        let tempRewards = [];

        let rewards =  JSON.parse(JSON.stringify(order.rewards));
        let orderedDiscounts = order.orderedDiscounts;
        let orderedOffers = order.orderedOffers;
        let orderedItems = order.orderedItems;

        let quantitySaleGroups = {};

        rewards.forEach(reward => {
            let found = orderedDiscounts.find(c => c._id === reward.promotion);
            if (found) {
                let offer = orderedOffers.find(c => c._id === found.target);
                reward.md = { orderedDiscount: found, offer: offer }
                reward.type = 'reward';
                tempRewards.push(reward);
            }
        });

        tempRewards.forEach(reward => {

            let offer = reward.md.offer;

            if (offer && offer.quantitySaleId) {
                if (quantitySaleGroups[offer.quantitySaleId] === undefined) {
                    quantitySaleGroups[offer.quantitySaleId] = [];
                }

                quantitySaleGroups[offer.quantitySaleId].push(reward);
            }
            else {
                result.push(reward);
            }

        });


        if (!order.onTheHouse) {

            orderedItems.forEach(item => {

                let offer = orderedOffers.find(c => item._id === _.get(c, 'orderedItems[0]'));
                if (!offer) {
                    return;
                }

                if (offer.onTheHouse && offer.onTheHouse.approved) {

                    let othType = _.get(offer, 'onTheHouse.reason.othType');

                    let discountItem = {
                        type: 'onTheHouse',
                        discountType: DiscountTypes.OTH,
                        amount: offer ? offer.amount : 0,
                        reasonName: resolveReasonDisplayData(item),
                        reasonType: !_.isEmpty(othType) ? translateService.getText('OTH_TYPE_' + offer.onTheHouse.reason.othType.toUpperCase()) : ''
                    };

                    if (offer.quantitySaleId) {
                        if (quantitySaleGroups[offer.quantitySaleId] === undefined) {
                            quantitySaleGroups[offer.quantitySaleId] = [];
                        }

                        quantitySaleGroups[offer.quantitySaleId].push(discountItem);
                    }
                    else {
                        result.push(discountItem);
                    }
                }

            });


            if (quantitySaleGroups !== undefined) {

                for (const key in quantitySaleGroups) {

                    if (quantitySaleGroups.hasOwnProperty(key)) {

                        const collection = quantitySaleGroups[key];

                        let qty = collection.length;
                        let offer = collection[0];
                        offer.qty = qty;
                        result.push(offer);

                    }
                }

            }

        } else {

            // Order OTH.

            let orderOthType = _.get(order, 'onTheHouse.reason.othType');

            result.push({
                type: 'onTheHouse',
                discountType: DiscountTypes.OTH,
                amount: order.totalAmount / 100,
                reasonName: `${_.get(order, 'onTheHouse.reason.name')}: ${_.get(order, 'onTheHouse.comment')}`,
                reasonType: !_.isEmpty(orderOthType) ? translateService.getText('OTH_TYPE_' + orderOthType.toUpperCase()) : ''
            });
        }


        result = result.map(c => {

            if (c.qty) {

                let amount = 0;
                let discountAmount = _.get(c, 'discount.amount');
                if (discountAmount !== undefined) {
                    amount = discountAmount;
                } else {
                    amount = c.amount
                }

                c.totalAmount = c.qty * amount;
            }

            return c;

        });

        return result;

    }

    function resolveDiscountsCollection(discounts) {

        let result = [];

        function getDiscountTypeText(discountType, discountItem) {

            let value = 0;

            switch (discountType) {
                case 'PercentOffOrder':
                    value = discountItem.discount.percentage + '%';
                    break;
                case 'AmountOff':
                case 'AmountOffOrder':
                    value = undefined
                    break;
                case 'PercentOff':
                    value = discountItem.discount.percentage + '%';
                    break;

            }

            let text = '';

            if (value) {
                text = `${value} `;
            }

            if (!_.isEmpty(discountType))
                text += translateService.getText(discountType.toUpperCase());

            if (discountItem.qty > 1) {
                text += ` ${discountItem.qty}x `;
            }

            return text;

        }

        discounts.forEach(discountItem => {

            if (discountItem.type === 'reward') {

                let discountType = discountItem._type;

                let othType = _.get(discountItem, 'md.orderedDiscount.reason.othType');

                result.push({
                    discountType: getDiscountTypeText(discountType, discountItem),
                    amount: discountItem.discount.amount,
                    reasonName: _.get(discountItem, 'md.orderedDiscount.reason.name'),
                    totalAmount: discountItem.totalAmount,
                    reasonType: !_.isEmpty(othType) ? translateService.getText(`OTH_TYPE_${othType.toUpperCase()}`) : ''
                });
            }
            else {

                // Set 0 when discount type is OTH.
                if (discountItem.type === "onTheHouse") {
                    discountItem.totalAmount = 0;
                    discountItem.amount = 0;
                }

                result.push(discountItem);
            }

        });

        return result;

    }

    function resolveReasonDisplayData(item) {

        let data = "";

        if (item.name) {
            data += `${item.name}`;
        }

        if (item.qty !== undefined) {
            data += ` ${item.qty}x`;
        }

        if (_.get(item, 'onTheHouse.reason.name') !== undefined) {
            data += ` - ${item.onTheHouse.reason.name}`;
        }

        if (_.get(item, 'onTheHouse.comment') !== undefined) {
            data += " : " + item.onTheHouse.comment;
        }

        return data;
    }

    function resolveDiscountsTimeLine(order, options) {

        let users = options.users;

        let orderedOffers = order.orderedOffers;
        let orderedDiscounts = order.orderedDiscounts;
        let rewards = JSON.parse(JSON.stringify(order.rewards));

        let result = [];
        let quantitySaleReward = [];

        function resolveOffer(reward) {
            let offer = '';
            if (reward && reward.requiredResources && reward.requiredResources[0] && reward.requiredResources[0].orderedOffer) {
                offer = orderedOffers.find(item => item._id === reward.requiredResources[0].orderedOffer);
            }
            return offer;
        }

        if (orderedDiscounts.length) {

            let rewardsHash = {};
            rewards.forEach(reward => {
                if (reward.requiredResources) {
                    reward.requiredResources.forEach(item => {
                        if (item.orderedDiscount) {
                            rewardsHash[item.orderedDiscount] = reward;
                        }
                    })
                }
            });

            let quantitySaleGroups = {};

            orderedDiscounts.forEach(discount => {

                let reward = rewardsHash[discount._id];

                let offer = resolveOffer(reward);

                let data;
                let action;
                let reasonName = discount.reason !== undefined ? discount.reason.name : "--";
                if (reward && reward._type) {
                    switch (reward._type) {
                        case 'PercentOffOrder':
                            action = translateService.getText('PERCENT_OFF_ORDER') + ' ' + reward.discount.percentage + '%';
                            data = reasonName;
                            break;

                        case 'AmountOffOrder':
                            action = translateService.getText('AMOUNT_OFF_ORDER') + ' ' + reward.discount.amount / 100;
                            data = reasonName;
                            break;

                        case 'PercentOff':
                            action = translateService.getText('PERCENT_OFF_ITEM') + ' ' + reward.discount.percentage + '%';
                            data = reasonName;
                            break;

                        case 'AmountOff':
                            action = translateService.getText('AMOUNT_OFF_ORDER') + ' ' + reward.discount.amount / 100;
                            data = reasonName;
                            break;
                    }
                }
                else {
                    return;
                    // if (discount && discount.discountType)
                    //     switch (discount.discountType) {
                    //         case "percent": {
                    //             action = translateService.getText('PERCENT_OFF_ORDER') + ' ' + discount.value + '%';
                    //             data = reasonName;
                    //             break;
                    //         }
                    //         case "amount": {
                    //             action = translateService.getText('AMOUNT_OFF_ORDER') + ' ' + discount.value / 100;
                    //             data = reasonName;
                    //             break;
                    //         }
                    //     }
                }

                if (reward && reward.discount && reward.discount.amount)
                    discount.discountAmount = reward.discount.amount;

                if (discount.comment) {
                    data += ': ' + discount.comment;
                }

                let record = {
                    action: action,
                    data: data,
                    name: offer.name,
                    at: discount.applied ? discount.applied.at : '',
                    by: userService.resolveUserName({ userId: _.get(discount, 'applied.by'), users: users })
                }



                if (offer.quantitySaleId) {

                    if (quantitySaleGroups[offer.quantitySaleId] === undefined) {
                        quantitySaleGroups[offer.quantitySaleId] = [];
                    }

                    quantitySaleGroups[offer.quantitySaleId].push(record);

                } else {

                    if (reward === undefined && record) {
                        if (quantitySaleReward.length === 0) {
                            quantitySaleReward.push(record);
                        }
                    }
                    else {
                        result.push(record);
                    }

                }

            });

            for (const key in quantitySaleGroups) {
                if (quantitySaleGroups.hasOwnProperty(key)) {
                    const collection = quantitySaleGroups[key];
                    let record = collection[0];
                    record.qty = collection.length;

                    // if (record.qty > 1) {
                    //     record.data += ` ${record.qty}x`;
                    // }

                    result.push(record);
                }
            }
        }

        return result.concat(quantitySaleReward);

    }

    function resolveTotalDiscount(order) {

        let rewards = JSON.parse(JSON.stringify(order.rewards));
        let totalDiscount = "";
        let totalDiscountName = "";

        rewards.forEach(reward => {

            let _discount = reward.discount;

            if (_discount) {
                if (_discount && (!_discount.rewardedResources)) {
                    totalDiscount = _discount.amount;
                    totalDiscountName = reward.manual ? translateService.getText('INITIATED_DISCOUNT') : reward.name;
                }
            }
        });

        return {
            totalDiscount: totalDiscount,
            totalDiscountName: totalDiscountName
        }
    }

    DiscountsService.prototype.resolveDiscounts = resolveDiscounts;
    DiscountsService.prototype.resolveDiscountsCollection = resolveDiscountsCollection;
    DiscountsService.prototype.resolveDiscountsTimeLine = resolveDiscountsTimeLine;
    DiscountsService.prototype.resolveTotalDiscount = resolveTotalDiscount;

    return DiscountsService;

})();
