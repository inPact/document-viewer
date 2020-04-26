
window.DocumentViewer.DishesService = (function () {


    function DishesService(options) {

    }

    function resolveDishes(order) {

        let result = [];

        let quantitySaleGroups = {};

        let orderedOffers = order.orderedOffers;

        orderedOffers.forEach(offer => {

            if (offer.quantitySaleId) {

                if (quantitySaleGroups[offer.quantitySaleId] === undefined) {
                    quantitySaleGroups[offer.quantitySaleId] = [];
                }

                quantitySaleGroups[offer.quantitySaleId].push(offer);

            } else {
                result.push(offer);
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

        result = result.map(offer => {

            if (offer.qty) {
                offer.amount = offer.qty * offer.amount;
            }

            return offer;

        });

        return result;

    }

    DishesService.prototype.resolveDishes = resolveDishes;

    return DishesService;


})();
