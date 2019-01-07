

import HtmlCreator from '../../helpers/htmlCreator.service';
import VatSection from '../sections/Vat.section';
import ReturnChargeAccount from '../sections/ReturnChargeAccount';
import HouseAccountPayment from '../houseAccountPayment.service';
import TlogDocsTranslateService from '../../tlog-docs-template/tlogDocsTranslate';
import Utils from '../../helpers/utils.service';

export default class RefundDeliveryNote {

    constructor(options) {

        this.$vatSection = new VatSection(options);
        this.$returnChargeAccount = new ReturnChargeAccount(options);
        this.$houseAccountPayment = new HouseAccountPayment(options);

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


        // START VAT SECRION
        let elementVatSection = this.$vatSection.get({
            isRefund: isRefund,
            variables: variables,
            collections: collections
        });
        // END VAT SECRION


        // START CHARGE ACCOUNT SECTION
        let elementReturnChargeAccountSection = this.$returnChargeAccount.get({
            variables: variables,
            collections: collections
        });
        // END CHARGE ACCOUNT SECTION


        // START HOUSE ACCOUNT PAYMENT
        let elementHouseAccountPaymentSection = this.$houseAccountPayment.get({
            variables: variables,
            collections: collections
        });
        // END  HOUSE ACCOUNT PAYMENT


        elementRefundDeliveryNote.appendChild(elementVatSection);

        elementRefundDeliveryNote.appendChild(elementReturnChargeAccountSection);

        elementRefundDeliveryNote.appendChild(elementHouseAccountPaymentSection);

        return elementRefundDeliveryNote;

    }

}
