
import TlogDocsTranslateService from '../tlog-docs-template/tlogDocsTranslate';

export default class SlipService {

    constructor(options) {
        this.$translate = new TlogDocsTranslateService(options);
    }

    getTitle(options) {

        let type = options.type;
        let number = options.number;

        console.log("getTitle");
        console.log(options);

        switch (type) {
            case "orderBill": {
                return `${this.$translate.getText('order')} ${number}`;
            }
            case "tlog": {
                return `${this.$translate.getText('order')} ${number}`;
            }
            case "invoice": {
                return `${this.$translate.getText('invoice_number')} ${number}`;
            }
            case "refundInvoice": {
                return `${this.$translate.getText('credit_invoice_number')} ${number}`;
            }
            case "deliveryNote": {
                return `${this.$translate.getText('delivery_note_number')} ${number}`;
            }
            case "refundDeliveryNote": {
                return `${this.$translate.getText('refund_note_number')} ${number}`;
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