
window.DocumentViewer.ItemsService = (function () {

    let userService;
    let translateService;

    const Enums = {
        ReturnTypes: {
            Cancellation: 'cancellation',
            TransactionBased: "TRANSACTION BASED",
            Transfer: "transfer"
        }
    }

    function ItemsService(options) {

        userService = new window.DocumentViewer.UserService();

        translateService = new window.DocumentViewer.EnrichOrderTranslateService({
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

    function resolveCencelledItems(order, options) {

        let users = options.users;

        let result = [];

        let quantitySaleGroups = {};

        let cancelledOffers = order.cancelledOffers;
        let orderedItems = order.orderedItems;

        cancelledOffers.forEach(offer => {

            let item = orderedItems.find(c => c._id === _.get(offer, 'cancelledItems[0]'));

            if (item && item.cancellation) {

                if (item.cancellation.applied) {
                    item.cancellation.applied.user = userService.resolveUserName({ userId: _.get(item, 'cancellation.applied.by'), users: users });
                }

                if (item.cancellation.approved) {
                    item.cancellation.approved.user = userService.resolveUserName({ userId: _.get(item, 'cancellation.approved.by'), users: users });
                }

                if (item.cancellation.reason) {

                    if (item.cancellation.reason.returnType === Enums.ReturnTypes.Cancellation) { // canceled items
                        item.displayReturnType = translateService.getText('CANCEL')
                    }
                    else if (item.cancellation.reason.returnType === Enums.ReturnTypes.Transfer) {
                        item.displayReturnType = translateService.getText('TRANSFER');
                    }
                    else { // returned items
                        item.displayReturnType = translateService.getText('RETURN');
                    }

                    item.cancellation.text = utilsText.getCommentText(item.cancellation.comment);

                }
                else {
                    console.log('reason object id missing');
                }

                if (offer.quantitySaleId) {
                    if (quantitySaleGroups[offer.quantitySaleId] === undefined) {
                        quantitySaleGroups[offer.quantitySaleId] = [];
                    }

                    quantitySaleGroups[offer.quantitySaleId].push(item);
                }
                else {
                    result.push(item);
                }

            }

        });

        if (quantitySaleGroups !== undefined) {

            for (const key in quantitySaleGroups) {

                if (quantitySaleGroups.hasOwnProperty(key)) {

                    const collection = quantitySaleGroups[key];

                    let qty = collection.length;
                    let item = collection[0];
                    item.qty = qty;
                    result.push(item);

                }
            }

        }

        return result;
    }


    function resolveUnasignedItems(order) {

        let result = [];

        let orederdOfferItems = [];

        let orderedItems = order.orderedItems;
        let orderedOffers = order.orderedOffers;

        orderedOffers.forEach(offer => {

            if (offer.orderedItems.length) {

                offer.items = [];
                offer.orderedItems.forEach(itemId => {
                    let orderedItem = orderedItems.find(c => c._id === itemId);
                    if (orderedItem) {
                        offer.items.push(orderedItem);
                        orederdOfferItems.push(orderedItem);
                    }

                })
            }

        });

        orderedItems.forEach(item => {

            if (!item.cancellation) {

                let found = orederdOfferItems.find(c => c._id === item._id);
                if (!found) {
                    result.push(item);
                }
            }

        });

        return result;

    }



    ItemsService.prototype.resolveCencelledItems = resolveCencelledItems;
    ItemsService.prototype.resolveUnasignedItems = resolveUnasignedItems;


    return ItemsService;


})();
