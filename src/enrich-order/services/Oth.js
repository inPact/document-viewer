window.DocumentViewer.OthService = (function () {

    let translateService;
    let userService;
    let utils;

    function OthService(options) {

        translateService = new window.DocumentViewer.EnrichOrderTranslateService({
            local: options.local
        });

        userService = new window.DocumentViewer.UserService();

    }

    function resolveOrderOTH(order, options) {

        let users = options.users;

        let result = [];
        let data;

        if (order.onTheHouse) {

            data = order.onTheHouse.reason.name;
            if (order.onTheHouse.comment) {
                data += ': ' + order.onTheHouse.comment;
            }

            // OTH request
            result.push({
                action: translateService.getText('OTH_ORDER_APPLIED'),
                data: data,
                at: order.onTheHouse.applied.at,
                by: userService.resolveUserName({ userId: _.get(order, 'onTheHouse.applied.by'), users: users })
            });

            // OTH approved
            if (order.onTheHouse.approved) {
                result.push({
                    action: translateService.getText('OTH_ORDER_APPROVED'),
                    data: data,
                    at: order.onTheHouse.approved.at,
                    by: userService.resolveUserName({ userId: _.get(order, 'onTheHouse.approved.by'), users: users }),
                });
            }
        }

        return result;
    }

    function resolveItemOTH(item, options) {

        let order = options.order;
        let onTheHouse = options.onTheHouse;
        let users = options.users;
        let result = [];

        let data = "";

        // if (item.name) {
        //     data += `${item.name}`;
        // }

        // if (item.qty !== undefined && item.name) {
        //     data += ` ${item.qty}x`;
        // }

        if (onTheHouse && onTheHouse.reason && onTheHouse.reason.name) {
            data += `${onTheHouse.reason.name}`;
        }

        if (onTheHouse && onTheHouse.comment) {
            data += " : " + onTheHouse.comment;
        }

        // OTH request
        if (onTheHouse.applied) {
            result.push({
                qty: item.qty,
                action: translateService.getText('OTH_ITEM_APPLIED'),
                name: item.name,
                data: data,
                at: onTheHouse.applied ? onTheHouse.applied.at : '',
                by: userService.resolveUserName({ userId: _.get(onTheHouse, 'applied.by'), users: users })
            });
        }

        // OTH approved
        if (onTheHouse.approved) {
            result.push({
                qty: item.qty,
                action: translateService.getText('OTH_ITEM_APPROVED'),
                name: item.name,
                data: data,
                at: onTheHouse.approved ? onTheHouse.approved.at : '',
                by: userService.resolveUserName({ userId: _.get(onTheHouse, 'approved.by'), users: users })
            });
        }

        return result;

    }

    OthService.prototype.resolveOrderOTH = resolveOrderOTH;
    OthService.prototype.resolveItemOTH = resolveItemOTH;

    return OthService;

})();
