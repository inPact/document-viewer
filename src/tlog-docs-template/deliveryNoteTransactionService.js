import Utils from '../helpers/utils.service';
import TlogDocsTranslateService from './tlogDocsTranslate';
import VatTemplateService from './vatTemplateService';
import HtmlCreator from '../helpers/htmlCreator.serivce';

export default class DeliveryNoteTransactionDataService {
    constructor(options) {
        this._isUS = options.isUS;
        this.$translate = new TlogDocsTranslateService(options);
        this.$vatTemplateService = new VatTemplateService(options);
        this.$utils = new Utils();
        this.$htmlCreator = new HtmlCreator();
    }

    isNegative(number) {
        return this.$utils.isNegative(number)
    }

    createDeliveryNoteTransactionData(printData, doc) {
        this._doc = doc;
        var deliveryNoteTransactionDiv = this._doc.createElement('div');
        deliveryNoteTransactionDiv.id = 'deliveryNoteTransactionDiv';

        var deliveryVat = this.$vatTemplateService.createVatTemplate(printData, this._doc)
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

            var returnText = this.$translate.getText('RETURND_IN_CHARCHACCOUNT_FROM')
            var refundTextDiv = this._doc.createElement('div')
            refundTextDiv.id = "refundTextDiv";
            refundTextDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (hAccountPayments ? returnText + " " + hAccountPayments.CHARGE_ACCOUNT_NAME : "") + "</div>" +
                "<div class='total-amount " + this.isNegative(hAccountPayments.P_AMOUNT) + "'>" + (hAccountPayments.P_AMOUNT ? hAccountPayments.P_AMOUNT : "") + "</div>" +
                "</div>";

            refundTextDiv.classList += " padding-bottom";
            refundTextDiv.classList += " padding-top";
            refundTextDiv.classList += " tpl-body-div";

            dNoteChargeAccntDiv.appendChild(refundTextDiv);


        }
        else if (!printData.isRefund && hAccountPayments && hAccountPayments.P_AMOUNT) {


            var returnText = this.$translate.getText('PAID_IN_CHARCHACCOUNT_FROM')
            var refundTextDiv = this._doc.createElement('div')
            refundTextDiv.id = 'refundTextDiv';
            refundTextDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (hAccountPayments ? returnText + " " + hAccountPayments.CHARGE_ACCOUNT_NAME : "") + "</div>" +
                "<div class='total-amount " + this.isNegative(hAccountPayments.P_AMOUNT) + "'>" + (hAccountPayments.P_AMOUNT ? Number(hAccountPayments.P_AMOUNT).toFixed(2) : "") + "</div > " +
                "</div>";

            refundTextDiv.classList.add('padding-bottom');
            refundTextDiv.classList.add('padding-top');

            dNoteChargeAccntDiv.appendChild(refundTextDiv);

            if (hAccountPayments.P_CHANGE > 0) {
                var cashBackText = this.$translate.getText('TOTAL_CASHBACK')
                var cashBackDiv = this._doc.createElement('div');
                cashBackDiv.classList.add('tpl-body-div');
                cashBackDiv.classList.add('padding-top-0');

                cashBackDiv.innerHTML = "<div class='itemDiv'>" +
                    "<div class='total-name'>" + (hAccountPayments ? cashBackText : "") + "</div>" +
                    "<div class='total-amount " + this.isNegative(hAccountPayments.P_CHANGE) + "'>" + (hAccountPayments.P_CHANGE ? Number(hAccountPayments.P_CHANGE).toFixed(2) : "") + "</div>" +
                    "</div>";

                dNoteChargeAccntDiv.appendChild(cashBackDiv);
            } else {
                refundTextDiv.classList += " tpl-body-div";
            }


        }

        if (hAccountPayments) {

            //  if (hAccountPayments.P_CHANGE > 0) {
            //      var cashBackText = this.$translate.getText('TOTAL_CASHBACK')
            //      var cashBackDiv = this._doc.createElement('div')
            //      cashBackDiv.className += "cashBackDiv";
            //      cashBackDiv.innerHTML = "<div class='changeDiv'>" +
            //          "<div class='total-name'>" + (hAccountPayments ? cashBackText : "") + "</div>" +
            //          "<div class='number-data " + this.isNegative(hAccountPayments.P_CHANGE) + "'>" + (hAccountPayments.P_CHANGE ? Number(hAccountPayments.P_CHANGE).toFixed(2) : "") + "</div>" +
            //          "</div>";

            //      dNoteChargeAccntDiv.appendChild(cashBackDiv);
            //  }


            let houseAccountPaymentContainer = this.$htmlCreator.createSection({
                id: 'house-account-payment',
                classList: []
            });

            if (hAccountPayments.PROVIDER_TRANS_ID) {


                let elementChargeTransactionText = this.$htmlCreator.create({
                    type: 'div',
                    id: 'charge-transaction-text',
                    classList: ['total-name'],
                    value: this.$translate.getText('CHARGE_TRANSACTION')
                });

                let elementChargeTransactionValue = this.$htmlCreator.create({
                    type: 'div',
                    id: 'charge-transaction-value',
                    classList: ['number-data'],
                    value: hAccountPayments.PROVIDER_TRANS_ID || ''
                });

                let elementChargeTransaction = this.$htmlCreator.create({
                    type: 'div',
                    id: 'charge-transaction',
                    classList: ['itemDiv'],
                    value: undefined,
                    children: [
                        elementChargeTransactionText,
                        elementChargeTransactionValue
                    ]
                });

                // var providerTransText = this.$translate.getText('CHARGE_TRANSACTION')
                // var providerTransDiv = this._doc.createElement('div');
                // providerTransDiv.id = "providerTransDiv";
                // providerTransDiv.innerHTML = "<div class='itemDiv'>" +
                //     "<div class='total-name'>" + (hAccountPayments ? providerTransText : "") + "</div>" +
                //     "<div class='number-data'>" + (hAccountPayments.PROVIDER_TRANS_ID ? hAccountPayments.PROVIDER_TRANS_ID : "") + "</div>" +
                //     "</div>"

                houseAccountPaymentContainer.appendChild(elementChargeTransaction);

            }

            if (hAccountPayments.CHARGE_ACCOUNT_NAME) {
                // var cAccountNameText = this.$translate.getText('CHARGE_ACCOUNT_NAME')
                // var cAccountNameDiv = this._doc.createElement('div')
                // cAccountNameDiv.id = "cAccountNameDiv";
                // cAccountNameDiv.innerHTML = "<div class='itemDiv'>" +
                //     "<div class='total-name'>" + (hAccountPayments ? cAccountNameText : "") + "</div>" +
                //     "<div class='number-data'>" + (hAccountPayments.CHARGE_ACCOUNT_NAME ? hAccountPayments.CHARGE_ACCOUNT_NAME : "") +
                //     "</div></div>"

                // dNoteChargeAccntDiv.appendChild(cAccountNameDiv);

                let elementChargeAccountNameText = this.$htmlCreator.create({
                    type: 'div',
                    id: 'charge-account-name-text',
                    classList: ['total-name'],
                    value: this.$translate.getText('CHARGE_ACCOUNT_NAME')
                });

                let elementChargeAccountNameValue = this.$htmlCreator.create({
                    type: 'div',
                    id: 'charge-account-name-value',
                    classList: ['number-data'],
                    value: hAccountPayments.CHARGE_ACCOUNT_NAME || ''
                });

                let elementChargeAccountName = this.$htmlCreator.create({
                    type: 'div',
                    id: 'charge-account',
                    classList: ['itemDiv'],
                    value: undefined,
                    children: [
                        elementChargeAccountNameText,
                        elementChargeAccountNameValue
                    ]
                });

                houseAccountPaymentContainer.appendChild(elementChargeAccountName);

            }

            if (hAccountPayments.COMPANY_NAME) {
                // var companyNameText = this.$translate.getText('company')
                // var companyNameDiv = this._doc.createElement('div');
                // companyNameDiv.id = "companyNameDiv";
                // companyNameDiv.innerHTML = "<div class='itemDiv'>" +
                //     "<div class='total-name'>" + (hAccountPayments ? companyNameText : "") + "</div>" +
                //     "<div class='number-data'>" + (hAccountPayments.COMPANY_NAME ? hAccountPayments.COMPANY_NAME : "") +
                //     "</div></div>"

                // dNoteChargeAccntDiv.appendChild(companyNameDiv);


                let elementCompanyNameText = this.$htmlCreator.create({
                    type: 'div',
                    id: 'company-name-text',
                    classList: ['total-name'],
                    value: this.$translate.getText('company')
                });

                let elementCompanyNameValue = this.$htmlCreator.create({
                    type: 'div',
                    id: 'company-name-value',
                    classList: ['number-data'],
                    value: hAccountPayments.COMPANY_NAME || ''
                });

                let elementCompanyName = this.$htmlCreator.create({
                    type: 'div',
                    id: 'company-name',
                    classList: ['itemDiv'],
                    value: undefined,
                    children: [
                        elementCompanyNameText,
                        elementCompanyNameValue
                    ]
                });

                houseAccountPaymentContainer.appendChild(elementCompanyName);

            }

            if (hAccountPayments.LAST_4) {
                // var lastFourText = this.$translate.getText('LAST_4')
                // var lastFourDiv = this._doc.createElement('div')
                // lastFourDiv.id = "lastFourDiv";
                // lastFourDiv.innerHTML = "<div class='itemDiv'>" +
                //     "<div class='total-name'>" + (hAccountPayments ? lastFourText : " ") + "</div>" +
                //     "<div class='number-data'>" + (hAccountPayments.LAST_4 ? hAccountPayments.LAST_4 : " ") +
                //     "</div></div>"

                // dNoteChargeAccntDiv.appendChild(lastFourDiv);



                let elementLast4Text = this.$htmlCreator.create({
                    type: 'div',
                    id: 'last-4-text',
                    classList: ['total-name'],
                    value: this.$translate.getText('LAST_4')
                });

                let elementLast4Value = this.$htmlCreator.create({
                    type: 'div',
                    id: 'last-4-value',
                    classList: ['number-data'],
                    value: hAccountPayments.LAST_4 || ''
                });

                let elementLast4 = this.$htmlCreator.create({
                    type: 'div',
                    id: 'last-4',
                    classList: ['itemDiv'],
                    value: undefined,
                    children: [
                        elementLast4Text,
                        elementLast4Value
                    ]
                });

                houseAccountPaymentContainer.appendChild(elementLast4);


            }

            if (hAccountPayments.PROVIDER_PAYMENT_DATE) {

                // printData.collections.HOUSE_ACCOUNT_PAYMENTS[0];


                // var transactionTimeText = this.$translate.getText('TRANSACTION_TIME')
                // var transactionTimeDiv = this._doc.createElement('div')


                // let providerPaymentDate = this.$utils.toDate({
                //     isUS: this._isUS,
                //     date: hAccountPayments.PROVIDER_PAYMENT_DATE
                // });

                // transactionTimeDiv.innerHTML = "<div class='itemDiv'>" +
                //     "<div class='total-name'>" + (hAccountPayments ? transactionTimeText : "") + "</div>" +
                //     "<div class='number-data'>" + (hAccountPayments.PROVIDER_PAYMENT_DATE ? providerPaymentDate : "") +
                //     "</div></div>"

                // dNoteChargeAccntDiv.appendChild(transactionTimeDiv);

                let providerPaymentDate = this.$utils.toDate({
                    isUS: this._isUS,
                    date: hAccountPayments.PROVIDER_PAYMENT_DATE
                });

                let elementProviderPaymentDateText = this.$htmlCreator.create({
                    type: 'div',
                    id: 'provider-payment-date-text',
                    classList: ['total-name'],
                    value: this.$translate.getText('TRANSACTION_TIME')
                });

                let elementProviderPaymentDateValue = this.$htmlCreator.create({
                    type: 'div',
                    id: 'provider-payment-date-value',
                    classList: ['number-data'],
                    value: providerPaymentDate || ''
                });

                let elementProviderPaymentDate = this.$htmlCreator.create({
                    type: 'div',
                    id: 'last-4',
                    classList: ['itemDiv'],
                    value: undefined,
                    children: [
                        elementProviderPaymentDateText,
                        elementProviderPaymentDateValue
                    ]
                });

                houseAccountPaymentContainer.appendChild(elementProviderPaymentDate);

            }


            console.log("elementProviderPaymentDate");
            console.log("elementProviderPaymentDate");
            console.log(houseAccountPaymentContainer);
            console.log("elementProviderPaymentDate");
            console.log("elementProviderPaymentDate");

            dNoteChargeAccntDiv.appendChild(houseAccountPaymentContainer);
        }



        dNoteChargeAccntDiv.classList += ' tpl-body-div';
        deliveryNoteTransactionDiv.appendChild(dNoteChargeAccntDiv);
        return deliveryNoteTransactionDiv;
    }
}