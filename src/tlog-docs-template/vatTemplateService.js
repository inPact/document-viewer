import Utils from '../helpers/utils.service';
import TlogDocsTranslateService from './tlogDocsTranslate';
import HtmlCreator from '../helpers/htmlCreator.service';
import DocumentFactory from '../helpers/documentFactory.service';

export default class VatTemplateService {

    constructor(options) {
        this.$translate = new TlogDocsTranslateService(options);
        this.$utils = new Utils();
        this.$htmlCreator = new HtmlCreator();
        this.totalAmountRowExist = false;
    }

    isNegative(number) {
        return this.$utils.isNegative(number)
    }

    twoDecimals(number) {
        return this.$utils.twoDecimals(number);
    }

    notEmpty(field) {
        return this.$utils.notEmpty(field);
    }

    prepreText(options) {

        let isRefund = options.isRefund;
        let orderDocumentPrintType = options.ORDER_DOCUMENT_PRINT;

        if (isRefund) {
            return this.$translate.getText('refund');
        } else if (!isRefund && orderDocumentPrintType === 'MULTI_DOC') {
            return this.$translate.getText('BUSINESS_MEAL');
        } else if (!isRefund && orderDocumentPrintType === 'SINGLE_DOC') {
            return this.$translate.getText('TOTAL_AMOUNT');
        }

    }

    getVatDocumentItems(options) {

        let resultCollection = [];

        let DOCUMENT_ITEMS = _.get(options, 'DOCUMENT_ITEMS');
        let isRefund = _.get(options, 'isRefund');
        let variables = _.get(options, 'variables');

        DOCUMENT_ITEMS.forEach(item => {

            let elementVatHeaderText = this.$htmlCreator.create({
                type: 'div',
                id: 'vat-header-text',
                classList: ['total-name'],
                value: this.prepreText({
                    isRefund: isRefund,
                    ORDER_DOCUMENT_PRINT: _.get(variables, 'ORDER_DOCUMENT_PRINT')
                })
            });

            let classList = ['total-amount'];
            let negativeClass = this.$utils.isNegative(item.ITEM_AMOUNT);
            if (negativeClass !== "") {
                classList.push(negativeClass);
            }

            let elementVatHeaderValue = this.$htmlCreator.create({
                type: 'div',
                id: 'vat-header-value',
                classList: classList,
                value: this.$utils.toFixedSafe(item.ITEM_AMOUNT, 2) || ''
            });

            let elementVatHeader = this.$htmlCreator.create({
                type: 'div',
                id: 'vat-header',
                classList: ['itemDiv', 'bold'],
                children: [
                    elementVatHeaderText,
                    elementVatHeaderValue
                ]
            });

            resultCollection.push(elementVatHeader);
        });

        return resultCollection;

    }

    getVatTotals(options) {

        let resultCollection = [];

        let isRefund = _.get(options, 'isRefund');
        let variables = _.get(options, 'variables');
        let collections = _.get(options, 'collections');

        let vatData = {
            TOTAL_EX_VAT: _.get(variables, 'TOTAL_EX_VAT'),
            VAT_AMOUNT: _.get(variables, 'VAT_AMOUNT'),
            VAT_PERCENT: this.twoDecimals(_.get(variables, 'VAT_PERCENT', 0)),
            TOTAL_IN_VAT: _.get(variables, 'TOTAL_IN_VAT'),
            ITEM_AMOUNT: _.get(variables, 'TOTAL_AMOUNT'),
            TIP_AMOUNT: _.get(variables, 'TOTAL_TIPS', 0)
        }


        let elementTotalAmountText = this.$htmlCreator.create({
            type: 'div',
            id: 'total-amount-text',
            classList: ['total-name'],
            value: this.prepreText({
                isRefund: isRefund,
                ORDER_DOCUMENT_PRINT: _.get(variables, 'ORDER_DOCUMENT_PRINT')
            })
        });

        let classList = ['total-amount'];
        let negativeClass = this.$utils.isNegative(variables.TOTAL_AMOUNT);
        if (negativeClass !== "") {
            classList.push(negativeClass);
        }

        let elementTotalAmountValue = this.$htmlCreator.create({
            type: 'div',
            id: 'total-amount-value',
            classList: classList,
            value: this.$utils.toFixedSafe(variables.TOTAL_AMOUNT, 2)
        });


        let elementTotalAmount = this.$htmlCreator.create({
            type: 'div',
            id: 'total-amount',
            classList: ['itemDiv', 'bold'],
            children: [
                elementTotalAmountText,
                elementTotalAmountValue
            ]
        });

        resultCollection.push(elementTotalAmount);

        let vatDataTemplateDiv = this.createVatDataTemplate({
            vat: vatData,
            isMulti: false,
            variables: variables,
            collections: collections
        });

        resultCollection.push(vatDataTemplateDiv);

        return resultCollection;
    }

    getOrderDiscount(options) {

        let resultCollection = [];

        let variables = _.get(options, 'variables');
        let collections = _.get(options, 'collections');

        let ORDER_DISCOUNTS_LIST = _.get(collections, 'ORDER_DISCOUNTS_LIST', []);


        if (ORDER_DISCOUNTS_LIST.length > 0) {
            let elementOrderTotalText = this.$htmlCreator.create({
                type: 'div',
                id: 'order-total-text',
                classList: ['total-name'],
                value: this.$translate.getText('TOTAL_ORDER')
            });

            let elementOrderTotalValue = this.$htmlCreator.create({
                type: 'div',
                id: 'order-total-text',
                classList: ['total-amount'],
                value: this.$utils.toFixedSafe(variables.TOTAL_SALES_AMOUNT, 2) || ''
            });

            let elementOrderTotal = this.$htmlCreator.create({
                type: 'div',
                id: 'order-total',
                classList: ['itemDiv'],
                children: [
                    elementOrderTotalText,
                    elementOrderTotalValue
                ]
            });

            this.totalAmountRowExist = true;
            resultCollection.push(elementOrderTotal);

        }

        ORDER_DISCOUNTS_LIST.forEach(orderDiscounts => {

            let elementOrderDiscountText = this.$htmlCreator.create({
                type: 'div',
                id: 'order-discount-text',
                classList: ['total-name'],
                value: orderDiscounts.DISCOUNT_NAME || this.$translate.getText('ORDER_DISCOUNT')
            });

            let elementOrderDiscountValue = this.$htmlCreator.create({
                type: 'div',
                id: 'order-discount-value',
                classList: ['total-amount', 'negative'],
                value: this.$utils.toFixedSafe(_.get(orderDiscounts, 'DISCOUNT_AMOUNT', 0) * -1, 2) || ''
            });

            let elementOrderDiscount = this.$htmlCreator.create({
                type: 'div',
                id: 'order-discount',
                classList: ['itemDiv'],
                children: [
                    elementOrderDiscountText,
                    elementOrderDiscountValue
                ]
            });

            resultCollection.push(elementOrderDiscount);

        });

        return resultCollection;
    }

    createVatTemplate(options) {

        this._doc = DocumentFactory.get();

        let isRefund = _.get(options, 'isRefund');
        let printData = _.get(options, 'printData');

        let vatContainer = this.$htmlCreator.create({
            type: 'div',
            id: 'vat-template',
            classList: []
        });

        let DOCUMENT_ITEMS = _.get(printData, 'collections.DOCUMENT_ITEMS', []);

        if (DOCUMENT_ITEMS && DOCUMENT_ITEMS.length > 0) {

            let elementDocumentItems = this.getVatDocumentItems({
                DOCUMENT_ITEMS: DOCUMENT_ITEMS,
                isRefund: isRefund,
                variables: _.get(printData, 'variables')
            });

            elementDocumentItems.forEach(element => {
                vatContainer.appendChild(element);
            });

            let vatDataTemplateDiv = this.createVatDataTemplate({
                vat: DOCUMENT_ITEMS,
                isMulti: true,
                variables: printData.variables,
                collections: printData.collections
            });

            vatContainer.appendChild(vatDataTemplateDiv);
        }
        else {

            /**
             * Show tip line only in 'SINGLE_DOC' mode (only in one payment).
             */
            if (_.get(printData, 'variables.ORDER_DOCUMENT_PRINT') === 'SINGLE_DOC') {

                // if is a 'SINGLE_DOC' and has a discount in the order.
                let orderDiscountElements = this.getOrderDiscount({
                    variables: printData.variables,
                    collections: printData.collections,
                });

                orderDiscountElements.forEach(element => {
                    vatContainer.appendChild(element);
                });

                let elementTotalOrderAndTip = this.createElementTotalOrderAndTip({
                    variables: printData.variables,
                    collections: printData.collections,
                });

                vatContainer.appendChild(elementTotalOrderAndTip);
            }

            let elementsVatTotal = this.getVatTotals({
                isRefund: isRefund,
                variables: printData.variables,
                collections: printData.collections
            });

            elementsVatTotal.forEach(element => {
                vatContainer.appendChild(element);
            });

        }

        return vatContainer;

    }

    createVatDataTemplate(options) {

        let vat = _.get(options, 'vat');
        let isMulti = _.get(options, 'isMulti');
        let collections = _.get(options, 'collections');
        let variables = _.get(options, 'variables');

        // Old 

        let vatDataTemplate = this._doc.createElement('div');
        vatDataTemplate.id = "VatDataTemplate";

        let vatDataDiv = this._doc.createElement('div');
        vatDataDiv.id = "vatDataDiv";

        vatDataDiv.classList += " padding-bottom";
        vatDataDiv.classList += " padding-top";
        vatDataDiv.classList += " tpl-body-div";

        let beforeVatTranslate = this.$translate.getText('BEFORE_VAT');
        let vatTranslate = this.$translate.getText('VAT');
        let tipTranslate = this.$translate.getText('TIP');
        let includeVatTranslate = this.$translate.getText('INCLUDE_VAT');

        let beforeVatDiv = this._doc.createElement('div');
        let vatTextDiv = this._doc.createElement('div');
        let TipDiv = this._doc.createElement('div');
        let includeVatDiv = this._doc.createElement('div');

        let tipAmount = 0;
        if (isMulti) {
            beforeVatDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (this.notEmpty(vat[0].ITEM_AMOUNT_EX_VAT) ? beforeVatTranslate : "") + "</div>" + " " +
                "<div class='total-amount " + this.isNegative(vat[0].ITEM_AMOUNT_EX_VAT) + "'>" + (this.notEmpty(vat[0].ITEM_AMOUNT_EX_VAT) ? Number(vat[0].ITEM_AMOUNT_EX_VAT).toFixed(2) : "") + "</div>" +
                "</div>";

            vatTextDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (this.notEmpty(vat[0].ITEM_VAT_PERCENT) ? vatTranslate : "") + " " + (vat[0].ITEM_VAT_PERCENT) + "%" + "</div>" + " " +
                "<div class='total-amount " + this.isNegative(vat[0].ITEM_VAT_AMOUNT) + "'>" + (this.notEmpty(vat[0].ITEM_VAT_AMOUNT) ? Number(vat[0].ITEM_VAT_AMOUNT).toFixed(2) : "") + "</div>" +
                "</div>";

            tipAmount = vat[0].ITEM_TIP;
            TipDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (this.notEmpty(vat[0].ITEM_TIP) ? tipTranslate : "") + "</div>" + " " +
                "<div class='total-amount " + this.isNegative(vat[0].ITEM_TIP) + "'>" + (this.notEmpty(vat[0].ITEM_TIP) ? Number(vat[0].ITEM_TIP).toFixed(2) : "") + "</div>" +
                "</div>";

            includeVatDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (this.notEmpty(vat[0].ITEM_AMOUNT) ? includeVatTranslate : "") + "</div>" + " " +
                "<div class='total-amount " + this.isNegative(vat[0].ITEM_AMOUNT) + "'>" + (this.notEmpty(vat[0].ITEM_AMOUNT) ? Number(vat[0].ITEM_AMOUNT).toFixed(2) : "") + "</div>" +
                "</div>";

        }
        else {

            beforeVatDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (this.notEmpty(vat.TOTAL_EX_VAT) ? beforeVatTranslate : "") + "</div>" + " " +
                "<div class='total-amount " + this.isNegative(vat.TOTAL_EX_VAT) + "'>" + (this.notEmpty(vat.TOTAL_EX_VAT) ? Number(vat.TOTAL_EX_VAT).toFixed(2) : "") + "</div>" +
                "</div>";

            vatTextDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (this.notEmpty(vat.VAT_AMOUNT) ? vatTranslate : "") + " " + vat.VAT_PERCENT + "%" + "</div>" + " " +
                "<div class='total-amount " + this.isNegative(vat.VAT_AMOUNT) + "'>" + this.$utils.toFixedSafe(vat.VAT_AMOUNT, 2) + "</div>" +
                "</div>";

            tipAmount = vat.TIP_AMOUNT;
            TipDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (this.notEmpty(vat.TIP_AMOUNT) ? tipTranslate : "") + "</div>" + " " +
                "<div class='total-amount " + this.isNegative(vat.TIP_AMOUNT) + "'>" + this.$utils.toFixedSafe(vat.TIP_AMOUNT, 2) + "</div>" +
                "</div>";

            includeVatDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (this.notEmpty(vat.TOTAL_IN_VAT) ? includeVatTranslate : "") + "</div>" + " " +
                "<div class='total-amount " + this.isNegative(vat.ITEM_AMOUNT) + "'>" + this.$utils.toFixedSafe(vat.ITEM_AMOUNT, 2) + "</div>" +
                "</div>";
        }

        vatDataDiv.appendChild(beforeVatDiv);
        vatDataDiv.appendChild(vatTextDiv);
        if (tipAmount > 0) {
            vatDataDiv.appendChild(TipDiv);
        }
        vatDataDiv.appendChild(includeVatDiv);

        vatDataTemplate.appendChild(vatDataDiv);
        return vatDataTemplate;
    }


    createElementTotalOrderAndTip(options) {

        let collections = _.get(options, 'collections');
        let variables = _.get(options, 'variables');

        /// Total Order Element.

        let totalsContainer = this.$htmlCreator.create({
            type: 'div',
            id: 'totals-container',
            classList: [],
            value: undefined
        });

        // Total After Discount
        let elementTotalOrderAfterDiscountText = this.$htmlCreator.create({
            type: 'div',
            id: 'total-order-text',
            classList: ['total-name'],
            value: this.$translate.getText('TOTAL_ORDER_AFTER_DISCOUNT')
        });

        let elementTotalOrderAfterDiscountValue = this.$htmlCreator.create({
            type: 'div',
            id: 'total-order-value',
            classList: ['total-amount'],
            value: this.$utils.toFixedSafe(variables.TOTAL_SALES_AMOUNT - variables.TOTAL_ORDER_DISCOUNTS, 2)
        });

        let elementTotalOrderAfterDiscount = this.$htmlCreator.create({
            type: 'div',
            id: 'total-order',
            classList: ['itemDiv'],
            value: undefined,
            children: [
                elementTotalOrderAfterDiscountText,
                elementTotalOrderAfterDiscountValue
            ]
        });

        // Total Without Discount

        let elementTotalOrderText = this.$htmlCreator.create({
            type: 'div',
            id: 'total-order-text',
            classList: ['total-name'],
            value: this.$translate.getText('TOTAL_ORDER')
        });

        let elementTotalOrderValue = this.$htmlCreator.create({
            type: 'div',
            id: 'total-order-value',
            classList: ['total-amount'],
            value: this.$utils.toFixedSafe(variables.TOTAL_SALES_AMOUNT, 2) || ''
        });

        let elementTotalOrder = this.$htmlCreator.create({
            type: 'div',
            id: 'total-order',
            classList: ['itemDiv'],
            value: undefined,
            children: [
                elementTotalOrderText,
                elementTotalOrderValue
            ]
        });

        // Total Tips Element.

        let elementTotalTipText = this.$htmlCreator.create({
            type: 'div',
            id: 'total-tip-text',
            classList: ['total-name'],
            value: this.$translate.getText('TOTAL_TIPS')
        });

        let elementTotalTipValue = this.$htmlCreator.create({
            type: 'div',
            id: 'total-tip-value',
            classList: ['total-amount'],
            value: this.$utils.toFixedSafe(variables.TOTAL_TIPS, 2) || ''
        });

        let elementTotalTip = this.$htmlCreator.create({
            type: 'div',
            id: 'total-tip',
            classList: ['itemDiv'],
            value: undefined,
            children: [
                elementTotalTipText,
                elementTotalTipValue
            ]
        });

        if (variables.TOTAL_SALES_AMOUNT !== variables.TOTAL_AMOUNT && !this.totalAmountRowExist) {
            totalsContainer.appendChild(elementTotalOrder); // Add total order element.
        }

        if (variables.TOTAL_ORDER_DISCOUNTS > 0 && variables.TOTAL_TIPS > 0) {
            totalsContainer.appendChild(elementTotalOrderAfterDiscount); // Add total order after discount element.
        }

        if (variables.TOTAL_TIPS !== undefined && variables.TOTAL_TIPS > 0) {

            totalsContainer.appendChild(elementTotalTip); // Add total tip element.
        }

        return totalsContainer;
    }
}
