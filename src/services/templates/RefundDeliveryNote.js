

import HtmlCreator from '../../helpers/htmlCreator.service';
import VatSection from '../sections/Vat.section';
import TlogDocsTranslateService from '../../tlog-docs-template/tlogDocsTranslate';
import Utils from '../../helpers/utils.service';

export default class RefundDeliveryNote {

    constructor(options) {
        this.$vatSection = new VatSection(options);
        this.$htmlCreator = new HtmlCreator();
        this.$translate = new TlogDocsTranslateService(options);
        this.$utils = new Utils();
    }

    get(options) {

        let isRefund = options.isRefund;
        let variables = options.variables;
        let collections = options.collections;

        let elementRefundDeliveryNote = this.$htmlCreator.create({
            id: 'refund-delivery-note',
            classList: ['refund-delivery-note']
        });

        let houseAccountPayment = _.get(collections, 'HOUSE_ACCOUNT_PAYMENTS[0]');


        // START VAT SECRION
        let elementVatSection = this.$vatSection.get({
            isRefund: isRefund,
            variables: variables,
            collections: collections
        });
        // END VAT SECRION


        // START CHARGE ACCOUNT SECTION
        let elementChargeAccountSection = this.$htmlCreator.createSection({
            id: 'return-in-charge-account-from-section',
            classList: ['charge-account-section',],
        });

        let elementChargeAccountText = this.$htmlCreator.create({
            id: 'return-in-charge-account-from-section',
            classList: ['charge-account-text'],
            value: `${this.$translate.getText('RETURND_IN_CHARCHACCOUNT_FROM')} ${houseAccountPayment.CHARGE_ACCOUNT_NAME}`
        });

        let elementChargeAccountValue = this.$htmlCreator.create({
            id: 'return-in-charge-account-from-section',
            classList: ['charge-account-value'],
            value: this.$utils.toFixedSafe(houseAccountPayment.P_AMOUNT || 0, 2) || ''
        });

        let elementChargeAccountContainer = this.$htmlCreator.create({
            id: 'charge-account-container',
            classList: ['charge-account-container', 'itemDiv'],
            children: [
                elementChargeAccountText,
                elementChargeAccountValue
            ]
        });

        elementChargeAccountSection.appendChild(elementChargeAccountContainer);
        // END CHARGE ACCOUNT SECTION


        elementRefundDeliveryNote.appendChild(elementVatSection);

        elementRefundDeliveryNote.appendChild(elementChargeAccountSection);

        return elementRefundDeliveryNote;

    }

}
