window.DocumentViewer.TableService = (function () {

    let translateService;

    const OrderTypes = {
        Refund: "Refund",
        TA: "TA",
        Delivery: "Delivery",
        Seated: "Seated",
        OTC: "OTC"
    };

    function TableService(options) {

        translateService = new window.DocumentViewer.EnrichOrderTranslateService({
            local: options.local
        });

    }

    function resolveTable(order, options) {

        let orderType = order.orderType;
        let tableIds = order.tableIds;

        let tables = options.tables;

        let table = "";
        if (orderType === OrderTypes.Refund) {
            table = translateService.getText('REFUND');
        } else if (orderType === OrderTypes.TA) {
            table = translateService.getText('TA');
        } else if (orderType === OrderTypes.Delivery) {
            table = translateService.getText('DELIVERY');
        }
        else {
            if (tables && tables.length > 0) {
                let _table = tables.find(c => c._id === tableIds[0]);
                table = _table ? _table.number : '';
            }
        }

        return table;

    }

    TableService.prototype.resolveTable = resolveTable;

    return TableService;

})();
