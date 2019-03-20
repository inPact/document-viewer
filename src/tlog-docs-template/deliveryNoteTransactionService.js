import Utils from '../helpers/utils.service';
import TlogDocsTranslateService from './tlogDocsTranslate';
import VatTemplateService from './vatTemplateService';
import SignatureService from './signatureService';

import HouseAccountPayment from '../services/houseAccountPayment.service';
import DocumentFactory from '../helpers/documentFactory.service';
import HtmlCreator from '../helpers/htmlCreator.service';

export default class DeliveryNoteTransactionDataService {
    constructor(options) {
        this._isUS = options.isUS;
        this.$translate = new TlogDocsTranslateService(options);
        this.$vatTemplateService = new VatTemplateService(options);
        this.$utils = new Utils();
        this.$houseAccountPayment = new HouseAccountPayment(options);
        this.$htmlCreator = new HtmlCreator();
        this.$signatureService = new SignatureService();
    }

    createDeliveryNoteTransactionData() {

        this._doc = DocumentFactory.get();

        let printData = DocumentFactory.getPrintData();
        let documentInfo = DocumentFactory.getDocumentInfo();


        var deliveryNoteTransactionDiv = this._doc.createElement('div');
        deliveryNoteTransactionDiv.id = 'deliveryNoteTransactionDiv';

        var deliveryVat = this.$vatTemplateService.createVatTemplate(printData, this._doc);
        deliveryVat.id = 'deliveryVat';

        deliveryVat.classList += ' padding-bottom';
        deliveryVat.classList += ' border-top';
        deliveryVat.classList += ' tpl-body-div';

        deliveryNoteTransactionDiv.appendChild(deliveryVat);

        var hAccountPayments;
        if (printData.collections.HOUSE_ACCOUNT_PAYMENTS[0]) {
            hAccountPayments = printData.collections.HOUSE_ACCOUNT_PAYMENTS[0];
        }
        var dNoteChargeAccntDiv = this._doc.createElement('div');
        dNoteChargeAccntDiv.id = 'dNoteChargeAccntDiv';
        if (printData.isRefund === true) {

            // var returnText = this.$translate.getText('RETURND_IN_CHARCHACCOUNT_FROM')
            // var refundTextDiv = this._doc.createElement('div')
            // refundTextDiv.id = "refundTextDiv";
            // refundTextDiv.innerHTML = "<div class='itemDiv'>" +
            //     "<div class='total-name'>" + (hAccountPayments ? returnText + " " + hAccountPayments.CHARGE_ACCOUNT_NAME : "") + "</div>" +
            //     "<div class='total-amount " + this.$utils.isNegative(hAccountPayments.P_AMOUNT) + "'>" + (hAccountPayments.P_AMOUNT ? hAccountPayments.P_AMOUNT : "") + "</div>" +
            //     "</div>";

            // refundTextDiv.classList += " padding-bottom";
            // refundTextDiv.classList += " padding-top";
            // refundTextDiv.classList += " tpl-body-div";


            let elementChargeAccountText = this.$htmlCreator.create({
                id: 'charge-account-text',
                classList: ['total-name'],
                value: this.$translate.getText('RETURND_IN_CHARCHACCOUNT_FROM') + " " + hAccountPayments.CHARGE_ACCOUNT_NAME
            });

            let classList = ['total-amount'];
            let negativeClass = this.$utils.isNegative(hAccountPayments.P_AMOUNT);
            if (negativeClass !== "") {
                classList.push(negativeClass);
            }

            let elementChargeAccountValue = this.$htmlCreator.create({
                id: 'charge-account-value',
                classList: classList,
                value: this.$utils.toFixedSafe(hAccountPayments.P_AMOUNT || 0, 2) || ''
            });

            let elementChargeAccountContainer = this.$htmlCreator.create({
                id: 'charge-account-refund-container',
                classList: ['itemDiv'],
                children: [
                    elementChargeAccountText,
                    elementChargeAccountValue
                ]
            });

            dNoteChargeAccntDiv.appendChild(elementChargeAccountContainer);

        }
        else if (!printData.isRefund && hAccountPayments && hAccountPayments.P_AMOUNT) {


            if (hAccountPayments.P_CHANGE > 0) {

                let elementChargeAccountText = this.$htmlCreator.create({
                    id: 'charge-account-text',
                    classList: ['total-name'],
                    value: this.$translate.getText('PAID_IN_CHARCHACCOUNT_FROM') + " " + hAccountPayments.CHARGE_ACCOUNT_NAME
                });

                let classList = ['total-amount'];
                let negativeClass = this.$utils.isNegative(hAccountPayments.P_AMOUNT);
                if (negativeClass !== "") {
                    classList.push(negativeClass);
                }

                let elementChargeAccountValue = this.$htmlCreator.create({
                    id: 'charge-account-value',
                    classList: classList,
                    value: this.$utils.toFixedSafe(hAccountPayments.P_AMOUNT || 0, 2) || ''
                });

                let elementChargeAccountContainer = this.$htmlCreator.create({
                    id: 'charge-account-refund-container',
                    classList: ['itemDiv'],
                    children: [
                        elementChargeAccountText,
                        elementChargeAccountValue
                    ]
                });

                dNoteChargeAccntDiv.appendChild(elementChargeAccountContainer);
            }

            // var returnText = this.$translate.getText('PAID_IN_CHARCHACCOUNT_FROM')
            // var refundTextDiv = this._doc.createElement('div')
            // refundTextDiv.id = 'refundTextDiv';
            // refundTextDiv.innerHTML = "<div class='itemDiv'>" +
            //     "<div class='total-name'>" + (hAccountPayments ? returnText + " " + hAccountPayments.CHARGE_ACCOUNT_NAME : "") + "</div>" +
            //     "<div class='total-amount " + this.$utils.isNegative(hAccountPayments.P_AMOUNT) + "'>" + (hAccountPayments.P_AMOUNT ? Number(hAccountPayments.P_AMOUNT).toFixed(2) : "") + "</div > " +
            //     "</div>";

            // refundTextDiv.classList.add('padding-bottom');
            // refundTextDiv.classList.add('padding-top');

            // dNoteChargeAccntDiv.appendChild(refundTextDiv);

            // if (hAccountPayments.P_CHANGE > 0) {
            //     var cashBackText = this.$translate.getText('TOTAL_CASHBACK')
            //     var cashBackDiv = this._doc.createElement('div');
            //     cashBackDiv.classList.add('tpl-body-div');
            //     cashBackDiv.classList.add('padding-top-0');

            //     cashBackDiv.innerHTML = "<div class='itemDiv'>" +
            //         "<div class='total-name'>" + (hAccountPayments ? cashBackText : "") + "</div>" +
            //         "<div class='total-amount " + this.$utils.isNegative(hAccountPayments.P_CHANGE) + "'>" + (hAccountPayments.P_CHANGE ? Number(hAccountPayments.P_CHANGE).toFixed(2) : "") + "</div>" +
            //         "</div>";

            //     dNoteChargeAccntDiv.appendChild(cashBackDiv);
            // } else {
            //     refundTextDiv.classList += " tpl-body-div";
            // }


        }


        /**
         * Add House Account Payment Section.
         */
        if (hAccountPayments) {

            let elementHouseAccountPayment = this.$houseAccountPayment.get({
                variables: printData.variables,
                collections: printData.collections
            })

            dNoteChargeAccntDiv.appendChild(elementHouseAccountPayment);
        }


        if (_.get(documentInfo, 'md.signature')) {

            let elementSignatureArea = this.$htmlCreator.create({
                type: 'div',
                id: 'signature-area',
                classList: ['item-div']
            });

            let elementSignature = this.$signatureService.getSignature(elementSignatureArea);

            dNoteChargeAccntDiv.appendChild(elementSignature);
        }



        dNoteChargeAccntDiv.classList += ' tpl-body-div';
        deliveryNoteTransactionDiv.appendChild(dNoteChargeAccntDiv);
        return deliveryNoteTransactionDiv;
    }
}