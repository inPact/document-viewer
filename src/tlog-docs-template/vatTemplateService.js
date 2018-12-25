import TlogDocsUtils from './tlogDocsUtils';
import TlogDocsTranslateService from './tlogDocsTranslate';

export default class VatTemplateService {
    constructor(options) {
        this.$translate = new TlogDocsTranslateService(options);
        this.$utils = new TlogDocsUtils();
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

     
                vatHeaderDiv.innerHTML = "<div class='itemDiv'>" +
                    "<div class='total-name'>" + (!(refundText === null) ? refundText : "") + (buisnessMealText ? buisnessMealText : "") + (totalAmountText ? totalAmountText : "") + "</div>" + " " +
                    "<div class='total-amount " + this.isNegative(item.ITEM_AMOUNT) + "'>" + (this.notEmpty(item.ITEM_AMOUNT) ? this.twoDecimals(item.ITEM_AMOUNT) : "") + "</div>" +
                    "</div>"
                vatTemplate.appendChild(vatHeaderDiv);

            })

            let vatDataTemplateDiv = this.createVatDataTemplate(vat, true)
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

            vatHeaderDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(refundText === null) ? refundText : "") + (buisnessMealText ? buisnessMealText : "") + (totalAmountText ? totalAmountText : "") + "</div>" + " " +
                "<div class='total-amount " + this.isNegative(vat.ITEM_AMOUNT) + "'>" + (this.notEmpty(vat.ITEM_AMOUNT) ? this.twoDecimals(vat.ITEM_AMOUNT) : "") + "</div>" +
                "</div>"

            vatTemplate.appendChild(vatHeaderDiv);

            let vatDataTemplateDiv = this.createVatDataTemplate(vat, false)
            vatTemplate.appendChild(vatDataTemplateDiv);
        }

        return vatTemplate;

    }

    createVatDataTemplate(vat, isMulti) {

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
                "<div class='total-amount " + this.isNegative(vat.TOTAL_INCLUDED_TAX) + "'>" + (this.notEmpty(vat.TOTAL_INCLUDED_TAX) ? this.twoDecimals(vat.TOTAL_INCLUDED_TAX) : "") + "</div>" +
                "</div>";

            includeVatDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (this.notEmpty(vat.TOTAL_IN_VAT) ? includeVatTranslate : "") + "</div>" + " " +
                "<div class='total-amount " + this.isNegative(vat.TOTAL_IN_VAT) + "'>" + (this.notEmpty(vat.TOTAL_IN_VAT) ? this.twoDecimals(vat.TOTAL_IN_VAT) : "") + "</div>" +
                "</div>";
        }

        vatDataDiv.appendChild(beforeVatDiv);
        vatDataDiv.appendChild(vatTextDiv);
        vatDataDiv.appendChild(includeVatDiv);

        vatDataTemplate.appendChild(vatDataDiv);
        return vatDataTemplate;
    }
}