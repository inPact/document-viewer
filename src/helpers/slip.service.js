
import TlogDocsTranslateService from '../tlog-docs-template/tlogDocsTranslate';

export default class SlipService {

    constructor(options) {
        this.$translate = new TlogDocsTranslateService(options);
    }

    getTitle(options) {

        let type = options.type;
        let printData = options.printData;
        let number = options.number;

        let variables = printData.variables;

        switch (type) {
            case "orderBill": {
                return `${this.$translate.getText('order')} ${variables.ORDER_NO}`;
            }
            case "invoice": {
                return `${this.$translate.getText('invoice_number')} ${variables.ORDER_NO}`;
            }
            case "refundInvoice": {
                return `${this.$translate.getText('credit_invoice_number')} ${variables.ORDER_NO}`;
            }
            case "deliveryNote": {
                return `${this.$translate.getText('delivery_note_number')} ${variables.ORDER_NO}`;
            }
            case "refundDeliveryNote": {
                return `${this.$translate.getText('refund_note_number')} ${variables.ORDER_NO}`;
            }
            case "creditCard": {
                return `${this.$translate.getText('CreditSlip')} ${number}`;
            }
            case "giftCard": {
                return `${this.$translate.getText('GiftCardCreditSlip')} ${number}`;
            }
            case "clubMembers": {
                return `${this.$translate.getText('clubMembers')}`;
            }
            case "check": {
                return `${this.$translate.getText('CHECK')} ${number}`;
            }
        }

    }

}