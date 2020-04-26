window.DocumentViewer.PromotionsService = (function () {

    let utils;

    function PromotionsService(options) {

        utils = new window.DocumentViewer.Utils();

    }

    function resolvePromotions(order, options) {

        let _promotions = options.promotions;

        let _service = {
            groupRewardsByOrderedDiscounts(rewards, orderedDiscounts) {

                let inOrderedDiscounts = [];
                let outOrderedDiscounts = [];

                rewards.forEach(reward => {

                    let promotionId = reward.promotion;

                    let orderedDiscount = orderedDiscounts.find(c => c._id === promotionId);

                    if (orderedDiscount) {
                        inOrderedDiscounts.push(reward);
                    }
                    else {
                        outOrderedDiscounts.push(reward);
                    }

                });

                return {
                    inOrderedDiscounts: inOrderedDiscounts,
                    outOrderedDiscounts: outOrderedDiscounts
                }

            },
            enrichRewardsWithOffer(collection, orderedOffers) {

                collection.forEach(reward => {

                    let orderedOfferId = _.get(reward, 'discount.rewardedResources[0].orderedOffer');
                    if (orderedOfferId === undefined) {
                        orderedOfferId = _.get(reward, 'discount.discountApportionment[0].resource.orderedOffer');
                    }

                    let orderedOffer = orderedOffers.find(c => c._id === orderedOfferId);
                    reward.md = { offer: orderedOffer };

                });

                return collection;
            },
            groupByQuantitySale(options) {

                let inOrderedDiscounts = options.inOrderedDiscounts;
                let outOrderedDiscounts = options.outOrderedDiscounts;

                let quantitySaleGroups = {};

                inOrderedDiscounts.forEach(reward => {

                    let quantitySaleId = _.get(reward, 'md.offer.quantitySaleId') ? reward.md.offer.quantitySaleId : null;

                    if (quantitySaleId !== undefined) {

                        if (!quantitySaleGroups.hasOwnProperty(quantitySaleId)) {
                            quantitySaleGroups[quantitySaleId] = [];
                        }

                        quantitySaleGroups[quantitySaleId].push(reward);

                    }

                });

                outOrderedDiscounts.forEach(reward => {

                    let quantitySaleId = _.get(reward, 'md.offer.quantitySaleId') ? reward.md.offer.quantitySaleId : null;

                    if (quantitySaleId !== undefined) {

                        if (!quantitySaleGroups.hasOwnProperty(quantitySaleId)) {
                            quantitySaleGroups[quantitySaleId] = [];
                        }

                        quantitySaleGroups[quantitySaleId].push(reward);

                    }

                });

                return quantitySaleGroups;
            }
        }

        let rewards =  JSON.parse(JSON.stringify(order.rewards));
        let orderedOffers = order.orderedOffers;
        let orderedDiscounts = order.orderedDiscounts;

        let rewardsByOrderedDiscounts = _service.groupRewardsByOrderedDiscounts(rewards, orderedDiscounts);
        rewardsByOrderedDiscounts.inOrderedDiscounts = _service.enrichRewardsWithOffer(rewardsByOrderedDiscounts.inOrderedDiscounts, orderedOffers);
        rewardsByOrderedDiscounts.outOrderedDiscounts = _service.enrichRewardsWithOffer(rewardsByOrderedDiscounts.outOrderedDiscounts, orderedOffers);

        let quantitySaleGroups = _service.groupByQuantitySale({
            inOrderedDiscounts: rewardsByOrderedDiscounts.inOrderedDiscounts,
            outOrderedDiscounts: rewardsByOrderedDiscounts.outOrderedDiscounts
        });

        for (const key in quantitySaleGroups) {
            if (quantitySaleGroups.hasOwnProperty(key)) {
                const quantitySaleGroup = quantitySaleGroups[key];

                quantitySaleGroups[key] = utils.uniqBy(quantitySaleGroup, 'promotion');

                quantitySaleGroups[key] = quantitySaleGroups[key].filter(reward => {
                    let promotion = _promotions.find(c => c._id === reward.promotion);
                    if (promotion !== undefined) {
                        reward.md.promotion = promotion;
                        return reward;
                    }
                });

            }
        }

        let result = _.union(Object.values(quantitySaleGroups));
        let merged = [].concat.apply([], result);

        return merged;

    }

    function resolvePromotionsCollection(rewards, orderedPromotions) {

        let result = [];

        rewards.forEach(reward => {

            let totalAmount = 0;

            if (reward.qty && _.get(reward, 'discount.amount')) {
                totalAmount = reward.qty * reward.discount.amount;
            }

            let promotionId = _.get(reward, 'md.promotion._id');
            let orderedPromotion = orderedPromotions.find(c => c.promotion === promotionId);

            result.push({
                qty: reward.qty,
                name: reward.name,
                amount: _.get(reward, 'discount.amount') || '',
                totalAmount: totalAmount,
                redeemCode: _.get(orderedPromotion, 'redeemCode')
            });

        });

        return result;

    }

    PromotionsService.prototype.resolvePromotions = resolvePromotions;
    PromotionsService.prototype.resolvePromotionsCollection = resolvePromotionsCollection;

    return PromotionsService;

})();
