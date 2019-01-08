

import HtmlCreator from '../helpers/htmlCreator.service';
import Utils from '../helpers/utils.service';
import TlogDocsTranslateService from '../tlog-docs-template/tlogDocsTranslate';

export default class HouseAccountPayment {

    constructor(options) {

        this._isUS = options.isUS;

        this.$htmlCreator = new HtmlCreator();
        this.$utils = new Utils();
        this.$translate = new TlogDocsTranslateService({
            isUS: options.isUS,
            locale: options.locale
        });
    }

    get(options) {

        let variables = options.variables;
        let collections = options.collections;

        let houseAccountPayment = _.get(collections, 'HOUSE_ACCOUNT_PAYMENTS[0]');

        let houseAccountPaymentContainer = this.$htmlCreator.createSection({
            id: 'house-account-payment',
            classList: ['house-account-payment', 'hide-bottom-border']
        });

        if (houseAccountPayment.PROVIDER_TRANS_ID) {

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
                value: houseAccountPayment.PROVIDER_TRANS_ID || ''
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

            houseAccountPaymentContainer.appendChild(elementChargeTransaction);

        }

        if (houseAccountPayment.CHARGE_ACCOUNT_NAME) {

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
                value: houseAccountPayment.CHARGE_ACCOUNT_NAME || ''
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

        if (houseAccountPayment.COMPANY_NAME) {

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
                value: houseAccountPayment.COMPANY_NAME || ''
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

        if (houseAccountPayment.LAST_4) {

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
                value: houseAccountPayment.LAST_4 || ''
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

        if (houseAccountPayment.PROVIDER_PAYMENT_DATE) {

            let providerPaymentDate = this.$utils.toDate({
                isUS: this._isUS,
                date: houseAccountPayment.PROVIDER_PAYMENT_DATE
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
                id: 'provider-payment-date',
                classList: ['itemDiv'],
                value: undefined,
                children: [
                    elementProviderPaymentDateText,
                    elementProviderPaymentDateValue
                ]
            });

            houseAccountPaymentContainer.appendChild(elementProviderPaymentDate);

        }

        return houseAccountPaymentContainer;
    }

}