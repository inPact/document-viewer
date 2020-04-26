
window.DocumentViewer.TimeLineService = (function () {

    let utils;
    let translateService;
    let paymentsService;
    let userService;
    let othService;
    let discountsService;
    let segmentationsService;
    let historiesService;

    const CourseActions = [
        'notified',
        'fired',
        'served',
        'prepared',
        'taken'
    ];

    const ReturnTypes = {
        Cancellation: 'cancellation',
        TransactionBased: "TRANSACTION BASED",
        Transfer: "transfer"
    };

    function TimeLineService(options) {

        utils = new window.DocumentViewer.Utils();

        translateService = new window.DocumentViewer.TranslateService({
            local: options.local
        });

        paymentsService = new window.DocumentViewer.PaymentsService({
            local: options.local
        });

        userService = new window.DocumentViewer.UserService();

        othService = new window.DocumentViewer.OthService({
            local: options.local
        });

        discountsService = new window.DocumentViewer.DiscountsService({
            local: options.local
        });

        segmentationsService = new window.DocumentViewer.SegmentationsService({
            local: options.local
        });

        historiesService = new window.DocumentViewer.HistoriesService({
            local: options.local
        });

    }

    let utilsText = {
        getCommentText(comment) {

            if (_.isEmpty(comment)) { return ""; }

            // patch to translate 'Transfering items'' check if is a transfering by the comment text

            if (comment.indexOf('Transfering items') === 0) {
                let arr = comment.split(' ');
                let table = arr[4];
                return translateService.getText('TRANSFERING_ITEMS_TO_TABLE', ['table'], [table]);
            } else {
                return comment;
            }

        }
    }

    let utilsData = (function () {

        function isTransferItem(data, item) {

            let returnType = _.get(item, 'cancellation.reason.returnType');

            if (returnType === "transfer") return true;

            return false;
        }

        function isRefundOrder(order) {

            let type = _.get(order, 'payments[0]._type', '');
            let isRefund = type.toUpperCase().indexOf('refund'.toUpperCase()) > -1;
            return isRefund;
        }

        return {
            isTransferItem: isTransferItem,
            isRefundOrder: isRefundOrder
        }

    })();

    let service = {
        getOpenedTime(order) {

            let action = translateService.getText('OPEN');
            let isRefund = utilsData.isRefundOrder(order);

            if ((order.orderType === 'Seated' && order.tableIds.length === 0) && !isRefund) {
                action = 'Open Tab';
            }

            return {
                action: action,
                data: translateService.getText('ORDER'),
                at: order.created,
                by: order.waiter
            };
        },
        getClosedTime(order) {
            return {
                action: translateService.getText('CLOSE'),
                data: translateService.getText('ORDER'),
                at: order.closed,
                by: '' // can't determine who closed order
            }
        },
        getCourse(order) {

            let result = [];

            let orderedItems = order.orderedItems;
            let orderedOffers = order.orderedOffers;
            let cancelledOffers = order.cancelledOffers;
            let courses = order.courses;

            function mappingItems(itemsIds) {

                let result = [];
                let quantitySaleGroups = {};

                if (itemsIds === undefined || itemsIds.length === 0)
                    return result;

                let _offers = orderedOffers.concat(cancelledOffers);

                _offers.forEach(offer => {

                    let itemid = itemsIds.find(itemid => itemid === _.get(offer, 'orderedItems[0]'));
                    if (!itemid) {
                        itemid = itemsIds.find(itemid => itemid === _.get(offer, 'cancelledItems[0]'));
                    }

                    let item = undefined;
                    if (itemid) {
                        item = orderedItems.find(item => item._id === itemid);
                    }

                    if (!item) {
                        return;
                    }

                    delete item.qty;

                    if (offer.quantitySaleId) {
                        if (quantitySaleGroups[offer.quantitySaleId] === undefined) {
                            quantitySaleGroups[offer.quantitySaleId] = [];
                        }

                        quantitySaleGroups[offer.quantitySaleId].push(item);
                    }
                    else {
                        result.push(item);
                    }

                });

                if (quantitySaleGroups !== undefined) {

                    for (const key in quantitySaleGroups) {

                        if (quantitySaleGroups.hasOwnProperty(key)) {

                            const collection = quantitySaleGroups[key];

                            let qty = collection.length;
                            let _item = collection[0];
                            _item.qty = qty;
                            result.push(_item);

                        }
                    }

                }

                return result;

            }

            courses.forEach(course => {

                let items = mappingItems(course.orderedItems).map(item => {

                    if (item.qty && item.qty > 1) {
                        return `${item.name} ${item.qty}x`;
                    } else {
                        return `${item.name}`;
                    }

                });

                CourseActions.forEach(action => {

                    if (_.has(course, action) && course[action]) {

                        let courseType = '';
                        if (course.courseType)
                            courseType = course.courseType.toUpperCase();

                        result.push({
                            action: action + ' ' + translateService.getText(courseType),
                            data: JSON.parse(JSON.stringify(items)).filter(c => c !== undefined).join(',  '),
                            at: course[action].at,
                            by: course[action].waiter
                        })
                    }

                });

            });

            return result;
        },
        getPayments(order, options) {

            let users = options.users;

            let payments = order.payments;

            let result = [];

            payments.forEach(payment => {
                result.push({
                    action: translateService.getText('PAYMENT'),
                    data: paymentsService.resolvePaymentData(payment), // Return array of values.
                    at: payment.lastUpdated,
                    by: userService.resolveUserName({ userId: payment.user, users: users }),
                    recordType: "payment" //only for the payments record in the time line.
                });
            });

            return result;
        },
        getApprovedBy(order, options) {

            let users = options.users;

            let payments = order.payments;

            let result = [];

            payments.forEach(payment => {

                let isApproved = false;
                let aprroved;

                if (payment.approved) {
                    aprroved = payment.approved;
                    isApproved = true;
                }

                if (isApproved) {
                    result.push({
                        action: translateService.getText('APPROVED'),
                        data: paymentsService.resolvePaymentData(payment), // Return array of values.
                        at: aprroved.at,
                        by: userService.resolveUserName({ userId: aprroved.by, users: users }),
                        isApproved: isApproved //only for the payments record in the time line.
                    });
                }
            });

            return result;

        },
        getCancellationsAndOTH(order, options) {

            let users = options.users;

            let orderedItems = order.orderedItems;
            let orderedOffers =  JSON.parse(JSON.stringify(order.orderedOffers));
            let cancelledOffers = order.cancelledOffers;

            let result = [];
            let tempResult = [];
            let quantitySaleGroups = {};

            orderedItems.forEach(item => {

                let offer = orderedOffers.find(c => item._id === _.get(c, 'orderedItems[0]'));
                if (!offer) {
                    offer = cancelledOffers.find(c => item._id === _.get(c, 'cancelledItems[0]'));
                    if (!offer) {
                        return;
                    }
                }


                if (offer.quantitySaleId) {
                    if (quantitySaleGroups[offer.quantitySaleId] === undefined) {
                        quantitySaleGroups[offer.quantitySaleId] = [];
                    }

                    quantitySaleGroups[offer.quantitySaleId].push(item);
                }
                else {
                    tempResult.push(item);
                }

            });

            if (quantitySaleGroups !== undefined) {

                for (const key in quantitySaleGroups) {

                    if (quantitySaleGroups.hasOwnProperty(key)) {

                        const collection = quantitySaleGroups[key];

                        let qty = collection.length;
                        let offer = collection[0];
                        offer.qty = qty;
                        tempResult.push(offer);
                    }
                }
            }

            let orderedItemsByQuantitySale = tempResult;

            orderedItemsByQuantitySale.forEach(item => {

                let offer = orderedOffers.find(c => _.get(c, 'offer._id') === item.offer);

                if (item.cancellation) {
                    let _reasonName = "";

                    if (_.get(item, 'cancellation.reason.returnType') === ReturnTypes.Transfer) {
                        _reasonName = translateService.getText('TRANSFER');
                    }
                    else if (item.cancellation.reason) {
                        _reasonName = item.cancellation.reason.name;
                    }

                    let data = _reasonName;
                    if (item.cancellation.comment) {
                        data += ': ' + utilsText.getCommentText(item.cancellation.comment);
                    }

                    if (item.cancellation.reason && item.cancellation.reason.returnType == 'cancellation') {

                        // cancellation request
                        result.push({
                            qty: item.qty,
                            action: translateService.getText('CANCEL_ITEM_APPLIED'),
                            name: item.name,
                            data: data,
                            at: _.get(item, 'cancellation.applied.at'),
                            by: userService.resolveUserName({ userId: _.get(item, 'cancellation.applied.by'), users: users })
                        });

                        // cancellation approved
                        if (item.cancellation.approved) {
                            result.push({
                                qty: item.qty,
                                action: translateService.getText('CANCEL_ITEM_APPROVED'),
                                name: item.name,
                                data: data,
                                at: _.get(item, 'cancellation.approved.at'),
                                by: userService.resolveUserName({ userId: _.get(item, 'cancellation.approved.by'), users: users })
                            });
                        }

                    } else {

                        let isTransfer = utilsData.isTransferItem(data, item);

                        // return request
                        result.push({
                            qty: item.qty,
                            action: isTransfer ? translateService.getText('TRANSFER_ITEM_APPLIED') : translateService.getText('RETURN_ITEM_APPLIED'),
                            name: item.name,
                            data: data,
                            at: _.get(item, 'cancellation.applied.at'),
                            by: userService.resolveUserName({ userId: _.get(item, 'cancellation.applied.by'), users: users })
                        });

                        // return approved
                        if (item.cancellation.approved) {
                            result.push({
                                qty: item.qty,
                                action: isTransfer ? translateService.getText('TRANSFER_ITEM_APPROVED') : translateService.getText('RETURN_ITEM_APPROVED'),
                                name: item.name,
                                data: data,
                                at: _.get(item, 'cancellation.approved.at'),
                                by: userService.resolveUserName({ userId: _.get(item, 'cancellation.approved.by'), users: users })
                            })
                        }
                    }
                }
                else if (item.onTheHouse && !order.onTheHouse && item.cancellation === undefined) {

                    // is OTH on item and not OTH on order.

                    let OTHItems = othService.resolveItemOTH(item, {
                        onTheHouse: item.onTheHouse || offer.onTheHouse,
                        order: order,
                        users: users
                    });

                    OTHItems.forEach(c => result.push(c));

                }


                // else if ((item.onTheHouse && !order.onTheHouse && !item.cancellation) || (offer && offer.onTheHouse && !order.onTheHouse)) {

                //     let OTHItems = othService.resolveItemOTH(item, {
                //         onTheHouse: item.onTheHouse || offer.onTheHouse,
                //         order: order,
                //         users: users
                //     });

                //     OTHItems.forEach(c => result.push(c));
                // }

            });

            let orderOTHs = othService.resolveOrderOTH(order, { users: users });
            orderOTHs.forEach(item => { result.push(item); });

            return result;

        },
        getDiscounts(order, options) {
            return discountsService.resolveDiscountsTimeLine(order, { users: options.users });
        },
        getSegmentations(order, options) {

            return segmentationsService.resolveSegmentationsTimeLine(order, {
                users: options.users
            });

        },
        getHistories(order, options) {

            return historiesService.resolveHistoriesToTimeLine(order, {
                users: options.users
            });
        }
        ,
        getDeliveryTime(order, options) {
            let result = [];

            if (order.orderType === 'Delivery') {
                if (order.delivered) {
                    result.push({
                        action: translateService.getText('DELIVERED'),
                        data: translateService.getText('ORDER'),
                        at: order.delivered.at,
                        by: userService.resolveUserName({ userId: order.delivered.by, users: options.users })
                    })
                }
            }

            return result;
        }
    }

    function resolveTimeLine(order, options) {

        let users = options.users;

        let timeline = [];

        // Resolve Opened Time.
        timeline.push(service.getOpenedTime(order));

        // Resolve Closed Time.
        timeline.push(service.getClosedTime(order));

        // Resolve Courses.
        let courses = service.getCourse(order);
        courses.forEach(courseItem => { timeline.push(courseItem); });

        // Resolve Payments.
        let payments = service.getPayments(order, { users: users });
        payments.forEach(paymentItem => { timeline.push(paymentItem); });

        // Resolve Approved By.
        let approvedBy = service.getApprovedBy(order, { users: users });
        approvedBy.forEach(approvedByItem => { timeline.push(approvedByItem); });

        // Resolve Cancellations And OTH.
        let cancellationsAndOTH = service.getCancellationsAndOTH(order, { users: users });
        cancellationsAndOTH.forEach(item => { timeline.push(item); });

        // Resolve Discounts.
        let discounts = service.getDiscounts(order, { users: users });
        discounts.forEach(discountItem => timeline.push(discountItem));

        // Resolve Segmentations.
        let segmentations = service.getSegmentations(order, { users: users });
        segmentations.forEach(segmentationItem => timeline.push(segmentationItem));

        // Resolve Histories.
        let histories = service.getHistories(order, { users: users });
        histories.forEach(historyItem => timeline.push(historyItem));

        // Resolve Delivery Time.
        let deliveries = service.getDeliveryTime(order, { users: users });
        deliveries.forEach(delivery => timeline.push(delivery));

        timeline = _.sortBy(timeline, 'at');

        return timeline;
    }

    TimeLineService.prototype.resolveTimeLine = resolveTimeLine;

    return TimeLineService;

})();
