

import HtmlCreator from '../../helpers/htmlCreator.service';
import Utils from '../../helpers/utils.service';
import TlogDocsTranslateService from '../../tlog-docs-template/tlogDocsTranslate';


export default class VatSection {

    constructor(options) {
        this.$htmlCreator = new HtmlCreator();
        this.$translate = new TlogDocsTranslateService(options);
        this.$utils = new Utils();
    }

    get(options) {

        let isRefund = options.isRefund;
        let variables = options.variables;
        let collections = options.collections;

        let isMulti = collections.DOCUMENT_ITEMS.length > 0;

        let vatContainer = this.$htmlCreator.createSection({
            id: 'vat-section',
            classList: ['vat-section']
        });

        let elementTotalContainer = this._getElementTotalContainer({
            isRefund: isRefund,
            variables: variables,
            collections: collections
        });

        let elementTotalExVatContainer = this._getElementTotalExVatContainer({
            isRefund: isRefund,
            variables: variables,
            collections: collections,
            value: isMulti ? collections.DOCUMENT_ITEMS[0].ITEM_AMOUNT_EX_VAT : variables.TOTAL_EX_VAT
        });

        let elementTotalIncludedTaxContainer = this._getElementTotalIncludedTaxContainer({
            isRefund: isRefund,
            variables: variables,
            collections: collections,
            value: isMulti ? collections.DOCUMENT_ITEMS[0].ITEM_VAT_AMOUNT : variables.TOTAL_INCLUDED_TAX,
            percent: isMulti ? collections.DOCUMENT_ITEMS[0].ITEM_VAT_PERCENT : variables.VAT_PERCENT
        });

        let elementTotalInVatContainer = this._getElementTotalInVatContainer({
            isRefund: isRefund,
            variables: variables,
            collections: collections,
            value: isMulti ? collections.DOCUMENT_ITEMS[0].ITEM_AMOUNT : variables.TOTAL_IN_VAT
        });

        vatContainer.appendChild(elementTotalContainer);
        vatContainer.appendChild(elementTotalExVatContainer);
        vatContainer.appendChild(elementTotalIncludedTaxContainer);
        vatContainer.appendChild(elementTotalInVatContainer);
    }

    // ITEM_AMOUNT or TOTAL_AMOUNT
    _getElementTotalContainer(options) {

        let isRefund = options.isRefund;
        let variables = options.variables;
        let collections = options.collections;

        let elementTotalText = this.$htmlCreator.create({
            id: 'total-text',
            classList: ['total-name'],
            value: this._getTotalText({
                isRefund: isRefund,
                ORDER_DOCUMENT_PRINT: variables.ORDER_DOCUMENT_PRINT
            })
        });

        let classList = ['total-amount'];
        let negativeClass = this.$utils.isNegative(variables.ITEM_AMOUNT);
        if (negativeClass !== "") {
            classList.push(negativeClass);
        }

        let elementTotalValue = this.$htmlCreator.create({
            id: 'total-value',
            classList: classList,
            value: this.$utils.toFixedSafe(variables.ITEM_AMOUNT || 0, 2) || ''
        });

        let elementTotalContainer = this.$htmlCreator.create({
            id: 'total-container',
            classList: ['itemDiv', 'bold'],
            children: [
                elementTotalText,
                elementTotalValue
            ]
        });

        return elementTotalContainer;
    }

    // ITEM_AMOUNT_EX_VAT or TOTAL_EX_VAT
    _getElementTotalExVatContainer(options) {

        let isRefund = options.isRefund;
        let variables = options.variables;
        let collections = options.collections;
        let value = options.value;

        let elementTotalExVatText = this.$htmlCreator.create({
            id: 'total-ex-vat-text',
            classList: ['total-name'],
            value: this.$translate.getText('BEFORE_VAT')
        });

        let classList = ['total-amount'];
        let negativeClass = this.$utils.isNegative(value);
        if (negativeClass !== "") {
            classList.push(negativeClass);
        }

        let elementTotalExVatValue = this.$htmlCreator.create({
            id: 'total-ex-vat-value',
            classList: classList,
            value: this.$utils.toFixedSafe(value || 0, 2) || ''
        });

        let elementTotalExVatContainer = this.$htmlCreator.create({
            id: 'total-ex-vat-container',
            classList: ['itemDiv'],
            children: [
                elementTotalExVatText,
                elementTotalExVatValue
            ]
        });

        return elementTotalExVatContainer;

    }

    // ITEM_VAT_AMOUNT or TOTAL_INCLUDED_TAX
    _getElementTotalIncludedTaxContainer(options) {

        let isRefund = options.isRefund;
        let variables = options.variables;
        let collections = options.collections;
        let value = options.value;
        let percent = options.percent;

        let elementTotalIncludedText = this.$htmlCreator.create({
            id: 'total-included-tax-text',
            classList: ['total-name'],
            value: `${this.$translate.getText('VAT')} ${percent}%`
        });

        let classList = ['total-amount'];
        let negativeClass = this.$utils.isNegative(value);
        if (negativeClass !== "") {
            classList.push(negativeClass);
        }

        let elementTotalIncludedValue = this.$htmlCreator.create({
            id: 'total-included-tax-value',
            classList: classList,
            value: this.$utils.toFixedSafe(value || 0, 2) || ''
        });

        let elementTotalIncludedContainer = this.$htmlCreator.create({
            id: 'total-included-tax-container',
            classList: ['itemDiv'],
            children: [
                elementTotalIncludedText,
                elementTotalIncludedValue
            ]
        });

        return elementTotalIncludedContainer;

    }

    // ITEM_AMOUNT or TOTAL_IN_VAT
    _getElementTotalInVatContainer(options) {

        let isRefund = options.isRefund;
        let variables = options.variables;
        let collections = options.collections;
        let value = options.value;

        let elementTotalInVatText = this.$htmlCreator.create({
            id: 'total-in-vat-text',
            classList: ['total-name'],
            value: this.$translate.getText('VAT')
        });

        let classList = ['total-amount'];
        let negativeClass = this.$utils.isNegative(value);
        if (negativeClass !== "") {
            classList.push(negativeClass);
        }

        let elementTotalInVatValue = this.$htmlCreator.create({
            id: 'total-in-vat-value',
            classList: classList,
            value: this.$utils.toFixedSafe(value || 0, 2) || ''
        });

        let elementTotalInVatContainer = this.$htmlCreator.create({
            id: 'total-in-vat-container',
            classList: ['itemDiv'],
            children: [
                elementTotalInVatText,
                elementTotalInVatValue
            ]
        });

        return elementTotalInVatContainer;

    }

    _getTotalText(options) {

        let isRefund = options.isRefund;
        let ORDER_DOCUMENT_PRINT = options.ORDER_DOCUMENT_PRINT;

        if (isRefund) {
            return this.$translate.getText('refund');
        }
        else if (ORDER_DOCUMENT_PRINT === 'SINGLE_DOC') {
            return this.$translate.getText('BUSINESS_MEAL');
        }
        else if (ORDER_DOCUMENT_PRINT === 'MULTI_DOC') {
            return this.$translate.getText('TOTAL_AMOUNT');
        }

    }

}
