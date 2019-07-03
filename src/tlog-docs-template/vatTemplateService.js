import Utils from '../helpers/utils.service';
import TlogDocsTranslateService from './tlogDocsTranslate';
import HtmlCreator from '../helpers/htmlCreator.service';

export default class VatTemplateService {
    constructor(options) {
        this.$translate = new TlogDocsTranslateService(options);
        this.$utils = new Utils();
        this.$htmlCreator = new HtmlCreator();
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

    createVatTemplate(printData, doc) {

        this._doc = doc;
        let vatTemplate = this._doc.createElement('div');
        vatTemplate.id = "vatTemplate";
        let vatHeaderDiv = this._doc.createElement('div');
        vatHeaderDiv.id = "vatHeaderDiv"
        let vat = {}
        if (printData.collections.DOCUMENT_ITEMS && printData.collections.DOCUMENT_ITEMS.length > 0) {
            vat = printData.collections.DOCUMENT_ITEMS;
            vat.forEach(item => {
                let refundText = null;
                let buisnessMealText = null;
                let totalAmountText = null;
                //check if refun, if does add  refund text
                if (printData.isRefund) {
                    let refundTranslate = this.$translate.getText('refund')
                    vatHeaderDiv.classList.add("bold");
                    refundText = refundTranslate;
                }
                //else, if not refund but multi doc, add buisness meal text
                else if (!printData.isRefund && printData.variables.ORDER_DOCUMENT_PRINT === 'MULTI_DOC') {
                    let buisnessMealTranslate = this.$translate.getText('BUSINESS_MEAL');
                    vatHeaderDiv.classList.add("bold");
                    buisnessMealText = buisnessMealTranslate;
                }
                //else, if not refund but single doc, add buisness meal text
                else if (!printData.isRefund && printData.variables.ORDER_DOCUMENT_PRINT === 'SINGLE_DOC') {
                    let totalAmountTranslate = this.$translate.getText('TOTAL_AMOUNT');
                    vatHeaderDiv.classList.add("bold");
                    totalAmountText = totalAmountTranslate;

                }


                vatHeaderDiv.innerHTML = "<div class='itemDiv bold'>" +
                    "<div class='total-name'>" + (!(refundText === null) ? refundText : "") + (buisnessMealText ? buisnessMealText : "") + (totalAmountText ? totalAmountText : "") + "</div>" + " " +
                    "<div class='total-amount " + this.isNegative(item.ITEM_AMOUNT) + "'>" + (this.notEmpty(item.ITEM_AMOUNT) ? this.twoDecimals(item.ITEM_AMOUNT) : "") + "</div>" +
                    "</div>"
                vatTemplate.appendChild(vatHeaderDiv);

            })

            // let elementTotalOrderAndTip = this.createElementTotalOrderAndTip({
            //     variables: printData.variables,
            //     collections: printData.collections,
            // });

            // vatTemplate.appendChild(elementTotalOrderAndTip);


            let vatDataTemplateDiv = this.createVatDataTemplate({
                vat: vat,
                isMulti: true,
                variables: printData.variables,
                collections: printData.collections
            });

            vatTemplate.appendChild(vatDataTemplateDiv);

        }
        else {

            let refundText = null;
            let buisnessMealText = null;
            let totalAmountText = null;
            if (printData.isRefund) {
                let refundTranslate = this.$translate.getText('refund');
                vatHeaderDiv.classList.add("bold");
                refundText = refundTranslate;
            }
            //else, if not refund but multi doc, add buisness meal text
            else if (!printData.isRefund && printData.variables.ORDER_DOCUMENT_PRINT === 'MULTI_DOC') {
                let buisnessMealTranslate = this.$translate.getText('BUSINESS_MEAL');
                vatHeaderDiv.classList.add("bold");
                buisnessMealText = buisnessMealTranslate;
            }
            //else, if not refund but single doc, add buisness meal text
            else if (!printData.isRefund && printData.variables.ORDER_DOCUMENT_PRINT === 'SINGLE_DOC') {
                let totalAmountTranslate = this.$translate.getText('TOTAL_AMOUNT');
                vatHeaderDiv.classList.add("bold");
                totalAmountText = totalAmountTranslate;


            }


            vat.TOTAL_EX_VAT = printData.variables.TOTAL_EX_VAT;
            vat.TOTAL_INCLUDED_TAX = printData.variables.TOTAL_INCLUDED_TAX;
            vat.VAT_PERCENT = this.twoDecimals(printData.variables.VAT_PERCENT);
            vat.TOTAL_IN_VAT = printData.variables.TOTAL_IN_VAT;
            vat.ITEM_AMOUNT = printData.variables.TOTAL_AMOUNT;


            /**
             * Show tip line only in 'SINGLE_DOC' mode (only in one payment).
             */
            if (printData.variables.ORDER_DOCUMENT_PRINT === 'SINGLE_DOC') {
                let elementTotalOrderAndTip = this.createElementTotalOrderAndTip({
                    variables: printData.variables,
                    collections: printData.collections,
                });

                vatTemplate.appendChild(elementTotalOrderAndTip);
            }

            let elementTotalAmountText = this.$htmlCreator.create({
                type: 'div',
                id: 'total-amount-text',
                classList: ['total-name'],
                value: (!(refundText === null) ? refundText : "") + (buisnessMealText ? buisnessMealText : "") + (totalAmountText ? totalAmountText : "") // copy from ilan code.
            });

            let classList = ['total-amount'];
            let negativeClass = this.$utils.isNegative(printData.variables.TOTAL_AMOUNT);
            if (negativeClass !== "") {
                classList.push(negativeClass);
            }

            let elementTotalAmountValue = this.$htmlCreator.create({
                type: 'div',
                id: 'total-amount-value',
                classList: classList,
                value: this.$utils.toFixedSafe(printData.variables.TOTAL_AMOUNT, 2)
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

            vatTemplate.appendChild(elementTotalAmount);

            let vatDataTemplateDiv = this.createVatDataTemplate({
                vat: vat,
                isMulti: false,
                variables: printData.variables,
                collections: printData.collections
            });

            vatTemplate.appendChild(vatDataTemplateDiv);
        }

        return vatTemplate;

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
        let includeVatTranslate = this.$translate.getText('INCLUDE_VAT');

        let beforeVatDiv = this._doc.createElement('div');
        let vatTextDiv = this._doc.createElement('div');
        let includeVatDiv = this._doc.createElement('div');

        if (isMulti) {
            beforeVatDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (this.notEmpty(vat[0].ITEM_AMOUNT_EX_VAT) ? beforeVatTranslate : "") + "</div>" + " " +
                "<div class='total-amount " + this.isNegative(vat[0].ITEM_AMOUNT_EX_VAT) + "'>" + (this.notEmpty(vat[0].ITEM_AMOUNT_EX_VAT) ? Number(vat[0].ITEM_AMOUNT_EX_VAT).toFixed(2) : "") + "</div>" +
                "</div>";

            vatTextDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (this.notEmpty(vat[0].ITEM_VAT_PERCENT) ? vatTranslate : "") + " " + (vat[0].ITEM_VAT_PERCENT) + "%" + "</div>" + " " +
                "<div class='total-amount " + this.isNegative(vat[0].ITEM_VAT_AMOUNT) + "'>" + (this.notEmpty(vat[0].ITEM_VAT_AMOUNT) ? Number(vat[0].ITEM_VAT_AMOUNT).toFixed(2) : "") + "</div>" +
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
                "<div class='total-name'>" + (this.notEmpty(vat.TOTAL_INCLUDED_TAX) ? vatTranslate : "") + " " + vat.VAT_PERCENT + "%" + "</div>" + " " +
                "<div class='total-amount " + this.isNegative(vat.TOTAL_INCLUDED_TAX) + "'>" + this.$utils.toFixedSafe(vat.TOTAL_INCLUDED_TAX, 2) + "</div>" +
                "</div>";

            includeVatDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (this.notEmpty(vat.TOTAL_IN_VAT) ? includeVatTranslate : "") + "</div>" + " " +
                "<div class='total-amount " + this.isNegative(vat.TOTAL_IN_VAT) + "'>" + this.$utils.toFixedSafe(vat.TOTAL_IN_VAT, 2) + "</div>" +
                "</div>";
        }

        vatDataDiv.appendChild(beforeVatDiv);
        vatDataDiv.appendChild(vatTextDiv);
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

        if (variables.TOTAL_TIPS !== undefined && variables.TOTAL_TIPS > 0) {
            totalsContainer.appendChild(elementTotalOrder); // Add total order element.
            totalsContainer.appendChild(elementTotalTip); // Add total tip element.
        }

        return totalsContainer;
    }
}