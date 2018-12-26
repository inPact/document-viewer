

import TlogDocsUtils from './tlogDocsUtils';

export default class {

    constructor(options) {
        this.$utils = new TlogDocsUtils();
        this._doc;
        this.taxExemptDiv;
        this.inclusiveTaxDiv;
        this.taxDataDiv = null;
    }


    isNegative(number) {
        return this.$utils.isNegative(number)
    }

    addTaxDataFunc(printData, doc, isGiftCardBill) {
        this._doc = doc;

        if (!isGiftCardBill && (
            (printData.data.taxes.InclusiveTaxes.length > 0 || printData.data.taxes.InclusiveTaxes[0] !== undefined) ||
            (printData.data.taxes.ExemptedTaxes.length > 0 || printData.data.taxes.ExemptedTaxes[0] !== undefined))
        ) {

            this.taxDataDiv = this._doc.createElement('div');
            this.taxDataDiv.id = 'taxDataDiv';

            if (printData.data.totals && printData.data.totals.length > 0) {
                printData.data.totals.forEach(total => {
                    let totalItemDiv = this._doc.createElement('div');
                    totalItemDiv.classList += 'totalItemDiv';
                    totalItemDiv.innerHTML = "<div class='itemDiv'>" +
                        "<div class='total-name'>" + (total.name ? total.name : " ") + total.rate + "%" + "</div>" + " " +
                        "<div class='total-amount " + this.isNegative(total.amount) + "'>" + (total.amount ? Number(total.amount).toFixed(2) : " ") + "</div>" +
                        "</div>"
                    this.taxDataDiv.appendChild(totalItemDiv)
                })
            }

            if (printData.data.payments && printData.data.payments.length > 0) {
                printData.data.payments.forEach(payment => {
                    let paymentItemDiv = this._doc.createElement('div');
                    paymentItemDiv.classList += 'paymentItemDiv';
                    paymentItemDiv.innerHTML = "<div class='itemDiv'>" +
                        "<div class='total-name'>" + (payment.name ? payment.name : " ") + "</div>" + " " +
                        "<div class='total-amount " + this.isNegative(payment.amount) + "'>" + (payment.amount ? Number(payment.amount).toFixed(2) : " ") + "</div>" +
                        "</div><div class='itemDiv'>" + (payment.holderName ? ('&nbsp;' + payment.holderName) : '') + "</div > ";

                    this.taxDataDiv.appendChild(paymentItemDiv)
                })
            }


            this.taxExemptDiv = this.createTaxExemptFunc(printData, this._doc);

            this.inclusiveTaxDiv = this.createInclusiveTaxFunc(printData, this._doc)

            if (this.taxExemptDiv) this.taxDataDiv.appendChild(this.taxExemptDiv);
            if (this.inclusiveTaxDiv) this.taxDataDiv.appendChild(this.inclusiveTaxDiv);

            return this.taxDataDiv;

        }

        return null;
    }


    createTaxExemptFunc(printData, doc) {
        let exmTaxItemsDiv = doc.createElement('div')
        if (printData.data.taxes.ExemptedTaxes.length > 0) {
            printData.data.taxes.ExemptedTaxes.forEach(exmTax => {
                let exmTaxItemDiv = doc.createElement('div');
                exmTaxItemDiv.classList += 'exmTaxItemDiv';
                exmTaxItemDiv.innerHTML = "<div class='itemDiv " + (exmTax.amount ? 'small-chars' : "") + "'>" +
                    "<div class='total-name'>" + (exmTax.amount ? '&nbsp;' : "") + (exmTax.name ? exmTax.name : " ") + (exmTax.amount ? "&nbsp;" + exmTax.rate + "%" : '') + "</div>" + " " +
                    "<div class='total-amount " + this.isNegative(exmTax.amount) + "'>" + "&nbsp;" + (exmTax.amount ? Number(exmTax.amount).toFixed(2) : " ") + "</div>" + "</div>"
                exmTaxItemsDiv.appendChild(exmTaxItemDiv)
            })
            return exmTaxItemsDiv;
        }
        return null;
    }

    createInclusiveTaxFunc(printData, doc) {
        let inclusiveItemsDiv = doc.createElement('div')
        if (printData.data.taxes.InclusiveTaxes.length > 0) {
            printData.data.taxes.InclusiveTaxes.forEach(incTax => {
                let incTaxItemDiv = doc.createElement('div');
                incTaxItemDiv.classList += 'incTaxItemDiv';
                incTaxItemDiv.innerHTML = "<div class='itemDiv " + (incTax.amount ? 'small-chars' : "") + "'>" +
                    "<div class='total-name'>" + (incTax.amount ? '&nbsp;' : "") + (incTax.name ? incTax.name : " ") + (incTax.amount ? "&nbsp;" + incTax.rate + "%" : '') + "</div>" + " " +
                    "<div class='total-amount " + this.isNegative(incTax.amount) + "'> &nbsp;" + (incTax.amount ? Number(incTax.amount).toFixed(2) : " ") + "</div>" + "</div>"
                inclusiveItemsDiv.appendChild(incTaxItemDiv)
            })
            return inclusiveItemsDiv;

        }
        return null;
    }

}
