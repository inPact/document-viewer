import TlogDocsUtils from '../tlogDocsUtils';
import TlogDocsTranslateService from '../tlogDocsTranslate';

export default class OrderInfoService {
    constructor(options) {
        this._isUS = options.isUS;
        this.$translate = new TlogDocsTranslateService(options);
        this.$utils = new TlogDocsUtils();
    }

    getOrderInfoText(printData, doc, docObj, docData) {
        this._doc = doc;
        this._docObj = docObj;
        this._docData = docData;
        let OrderInfoTextDiv = this.createOrderInfoText(printData);
        OrderInfoTextDiv.id = 'OrderInfoTextDiv'

        return OrderInfoTextDiv;
    }

    createOrderInfoText(printData) {
        var tplOrderInfoText = this._doc.createElement('div');
        tplOrderInfoText.id = 'tplOrderInfoText';
        //check if  all the order  is OTH and prints if it is

        if (printData.variables.ORDER_ON_THE_HOUSE === "1") {
            var allOrderOthTextDiv = this._doc.createElement('div');
            allOrderOthTextDiv.id = "allOrderOthTextDiv";
            allOrderOthTextDiv.innerHTML = this.$translate.getText('ALL_ORDER_OTH');
            allOrderOthTextDiv.classList += ' othDiv';
            tplOrderInfoText.appendChild(allOrderOthTextDiv);
        }
        //check if this is a retrun order and prints if it is

        if (printData.data.isReturnOrder && this._docObj.isFullOrderBill) {
            tplOrderInfoText.appendChild(this.createReturnOrderText(printData));
        }

        //check if this is order is tax exempted  and prints if it is
        if (printData.data.isTaxExempt) {
            var taxExemptText = this._doc.createElement('div');
            taxExemptText.id = 'taxExemptText';
            taxExemptText.innerHTML = "<div class='bigBold'>" + this.$translate.getText('EXEMPTED_TAX') + "</div>"
            tplOrderInfoText.appendChild(taxExemptText);

            if (printData.variables.TAX_EXEMPTION_CODE) {
                var isTaxExemptCodeDiv = this._doc.createElement('div');
                isTaxExemptCodeDiv.id = "isTaxExemptCodeDiv";
                isTaxExemptCodeDiv.innerHTML = "<div class='bold'>" + printData.variables.TAX_EXEMPTION_CODE; + "</div>"
                tplOrderInfoText.appendChild(isTaxExemptCodeDiv);
            }
            if (printData.variables.TAX_EXEMPTION_COMMENT) {
                var isTaxExemptCodeDiv = this._doc.createElement('div');
                isTaxExemptCodeDiv.id = "isTaxExemptCodeDiv";
                isTaxExemptCodeDiv.innerHTML = printData.variables.TAX_EXEMPTION_COMMENT;
                tplOrderInfoText.appendChild(isTaxExemptCodeDiv);
            }
        }

        return tplOrderInfoText;
    }



    createReturnOrderText(printData) {
        var returnOrderDiv = this._doc.createElement('div')
        returnOrderDiv.classList += ' centralize';
        var isReturnOrderTextDiv = this._doc.createElement('div');
        isReturnOrderTextDiv.id = "isReturnOrderTextDiv";
        isReturnOrderTextDiv.innerHTML = "<div class= 'bigBold'>" + (this.$translate.getText('RETURN_TRANSACTION')) + "</div>";
        returnOrderDiv.appendChild(isReturnOrderTextDiv);
        //return order comment
        if (printData.variables.RETURN_COMMENT) {
            var returnOrderCommentDiv = this._doc.createElement('div');
            returnOrderCommentDiv.id = "returnOrderCommentDiv";
            returnOrderCommentDiv.innerHTML = printData.variables.RETURN_COMMENT;
            returnOrderDiv.appendChild(returnOrderCommentDiv);
        }

        return returnOrderDiv;
    }
}