

import HtmlCreator from '../helpers/htmlCreator.serivce';
import Utils from '../helpers/utils.service';
import TlogDocsTranslateService from '../tlog-docs-template/tlogDocsTranslate';

export default class CreditTransaction {

    constructor(options) {
        this.$htmlCreator = new HtmlCreator();
        this.$utils = new Utils();
        this.$translate = new TlogDocsTranslateService({
            isUS: options.isUS,
            locale: options.locale
        });
    }

    get(options) {

        let isUS = this.isUS;
        let creditTransaction = options.data;

        console.log("creditTransaction");
        console.log(creditTransaction);
        console.log("creditTransaction");

        let creditTransactionContainer = this.$htmlCreator.createSection({
            id: 'credit-transaction',
            classList: []
        });

        console.log("----------creditTransaction.LAST_4");
        console.log(creditTransaction.LAST_4);
        console.log("-------------creditTransaction.LAST_4");

        if (creditTransaction.LAST_4) {


            console.log("creditTransaction.LAST_4");
            console.log(creditTransaction.LAST_4);
            console.log("creditTransaction.LAST_4");

            let elementLast4Text = this.$htmlCreator.create({
                type: 'div',
                id: 'credit-transaction-last-4-text',
                classList: ['total-name'],
                value: this.$translate.getText('LAST_4')
            });

            let elementLast4Value = this.$htmlCreator.create({
                type: 'div',
                id: 'credit-transaction-last-4-value',
                classList: ['number-data'],
                value: creditTransaction.LAST_4 || ''
            });

            let elementLast4 = this.$htmlCreator.create({
                type: 'div',
                id: 'credit-transaction-last-4',
                classList: ['itemDiv'],
                value: undefined,
                children: [
                    elementLast4Text,
                    elementLast4Value
                ]
            });

            creditTransactionContainer.appendChild(elementLast4);
        }


        if (creditTransaction.PROVIDER_PAYMENT_DATE) {

            let providerPaymentDate = this.$utils.toDate({
                isUS: isUS,
                date: creditTransaction.PROVIDER_PAYMENT_DATE
            });

            let elementProviderPaymentDateText = this.$htmlCreator.create({
                type: 'div',
                id: 'credit-transaction-provider-payment-date-text',
                classList: ['total-name'],
                value: this.$translate.getText('TRANSACTION_TIME')
            });

            let elementProviderPaymentDateValue = this.$htmlCreator.create({
                type: 'div',
                id: 'credit-transaction-provider-payment-date-value',
                classList: ['number-data'],
                value: providerPaymentDate || ''
            });

            let elementProviderPaymentDate = this.$htmlCreator.create({
                type: 'div',
                id: 'credit-transaction-provider-payment-date',
                classList: ['itemDiv'],
                value: undefined,
                children: [
                    elementProviderPaymentDateText,
                    elementProviderPaymentDateValue
                ]
            });

            creditTransactionContainer.appendChild(elementProviderPaymentDate);
        }

        if (creditTransaction.PROVIDER_TRANS_ID) {

            let elementTransactionIdText = this.$htmlCreator.create({
                type: 'div',
                id: 'credit-transaction-id-text',
                classList: ['total-name'],
                value: this.$translate.getText('TRANSACTION_NO')
            });

            let elementTransactionIdValue = this.$htmlCreator.create({
                type: 'div',
                id: 'credit-transaction-id-value',
                classList: ['number-data'],
                value: creditTransaction.PROVIDER_TRANS_ID || ''
            });

            let elementTransactionId = this.$htmlCreator.create({
                type: 'div',
                id: 'credit-transaction-id',
                classList: ['itemDiv'],
                value: undefined,
                children: [
                    elementTransactionIdText,
                    elementTransactionIdValue
                ]
            });

            creditTransactionContainer.appendChild(elementTransactionId);
        }

        if (creditTransaction.CONFIRMATION_NUMBER) {

            let elementConfirmaionNumberText = this.$htmlCreator.create({
                type: 'div',
                id: 'credit-transaction-confirmaion-number-text',
                classList: ['total-name'],
                value: this.$translate.getText('APPROVAL_NO')
            });

            let elementConfirmaionNumberValue = this.$htmlCreator.create({
                type: 'div',
                id: 'credit-transaction-confirmaion-number-value',
                classList: ['number-data'],
                value: creditTransaction.CONFIRMATION_NUMBER || ''
            });

            let elementConfirmaionNumber = this.$htmlCreator.create({
                type: 'div',
                id: 'credit-transaction-confirmaion-number',
                classList: ['itemDiv'],
                value: undefined,
                children: [
                    elementConfirmaionNumberText,
                    elementConfirmaionNumberValue
                ]
            });

            creditTransactionContainer.appendChild(elementConfirmaionNumber);
        }


        return creditTransactionContainer;

    }

}