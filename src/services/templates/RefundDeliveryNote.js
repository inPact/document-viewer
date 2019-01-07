

import VatSection from '../sections/Vat.section';

export default class RefundDeliveryNote {

    constructor(options) {
        this.$vatSection = new VatSection(options);
    }

    get(options) {

        let isRefund = options.isRefund;
        let variables = options.variables;
        let collections = options.collections;

        let elementVatSection = this.$vatSection.get({
            isRefund: isRefund,
            variables: variables,
            collections: collections
        });

        return elementVatSection;

    }

}
