import TlogDocsUtils from './tlogDocsUtils';
import TlogDocsTranslateService from './tlogDocsTranslate';

export default class CreateCreditSlipService {

    constructor(options) {
        this._options = {};
        this.$translate = new TlogDocsTranslateService(options);
        this.$utils = new TlogDocsUtils();
        this._locale;
        this._isUS;
        this._doc;
        this.configure(options)

    }
    configure(options) {
        if (options.locale) this._locale = options.locale;
        if (options.isUS) this._isUS = options.isUS;

    }
    createCreditSlip(printData, docObjChosen, doc) {
        this._doc = doc;
        let creditSlipDiv = this._doc.createElement('div');
        creditSlipDiv.id = 'creditSlipDiv';

        let creditSlipDoc;
        if (printData.collections.PAYMENT_LIST && printData.collections.PAYMENT_LIST.length > 0) {
            printData.collections.PAYMENT_LIST.forEach(payment => {
                if (payment.P_TENDER_TYPE === 'creditCard' &&
                    payment.P_ID === docObjChosen.md.paymentId
                ) {
                    creditSlipDoc = payment;
                }
            })
        }

        if (creditSlipDoc) {
            let transactionTypeDiv = this._doc.createElement('div');
            transactionTypeDiv.id = 'transactionTypeDiv';
            let TransactionTypeText = this.$translate.getText('TransactionType');
            transactionTypeDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(TransactionTypeText === null) ? TransactionTypeText : "") + ": "
                + (creditSlipDoc.TRANS_TYPE ? creditSlipDoc.TRANS_TYPE : "") + "</div></div>"

            transactionTypeDiv.classList += ' padding-top';
            creditSlipDiv.appendChild(transactionTypeDiv);

            let cardTypeDiv = this._doc.createElement('div');
            cardTypeDiv.id = 'cardTypeDiv';
            let cardTypeText = this.$translate.getText('CardType');
            if (creditSlipDoc.CARD_TYPE) {
                cardTypeDiv.innerHTML = "<div class='itemDiv'>" +
                    "<div class='total-name'>" + (!(cardTypeText === null) ? cardTypeText : "") + ": "
                    + (creditSlipDoc.CARD_TYPE ? creditSlipDoc.CARD_TYPE : "") + "</div></div>"
                creditSlipDiv.appendChild(cardTypeDiv)
            }

            let cardNumDiv = this._doc.createElement('div');
            cardNumDiv.id = 'cardNumDiv';
            let cardNumText = this.$translate.getText('CardNumber');
            cardNumDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(cardNumText === null) ? cardNumText : "") + ": " + (creditSlipDoc.CARD_NUMBER_MASKED ? creditSlipDoc.CARD_NUMBER_MASKED : "XXXX-" + creditSlipDoc.LAST_4) +
                "</div></div>"

            creditSlipDiv.appendChild(cardNumDiv)

            if (creditSlipDoc.P_TENDER_TYPE === 'creditCard') {
                let pTenderTypeDiv = this._doc.createElement('div');
                pTenderTypeDiv.id = 'pTenderTypeDiv';
                let pTenderTypeText = this.$translate.getText('CardHolder');
                pTenderTypeDiv.innerHTML = "<div class='itemDiv'>" +
                    (!(pTenderTypeText === null) ? pTenderTypeText : "") + ": " + (creditSlipDoc.CUSTOMER_NAME ? creditSlipDoc.CUSTOMER_NAME : "") +
                    "</div></div>"
                creditSlipDiv.appendChild(pTenderTypeDiv)
            }


            let dateTimeStr = creditSlipDoc.PROVIDER_PAYMENT_DATE;
            let dateTimeResult;
            let transactTimeText = this.$translate.getText('transactTimeText');
            let creditSlipTimeDiv = this._doc.createElement('div');
            creditSlipTimeDiv.classList += " creditSlipTimeDiv";

            if (this._isUS) dateTimeResult = this.$utils.formatDateUS(dateTimeStr);
            else if (!this._isUS) {
                dateTimeResult = this.$utils.formatDateIL(dateTimeStr);
            }
            creditSlipTimeDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (transactTimeText ? transactTimeText : "") + ": " + (transactTimeText ? dateTimeResult : "") + "</div>" +
                "</div>";

            creditSlipTimeDiv.classList += ' padding-bottom';

            creditSlipDiv.appendChild(creditSlipTimeDiv);

            let merchantDiv = this._doc.createElement('div');
            merchantDiv.id = 'merchantDiv';
            let merchantText = this.$translate.getText('Merchant');
            merchantDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(merchantText === null) ? merchantText : "") + ": " + (creditSlipDoc.MERCHANT_NUMBER ? creditSlipDoc.MERCHANT_NUMBER : "") +
                "</div></div>";
            merchantDiv.classList += ' padding-top';

            creditSlipDiv.appendChild(merchantDiv)

            let sequenceDiv = this._doc.createElement('div');
            sequenceDiv.id = 'sequenceDiv';
            let sequenceText = this.$translate.getText('Sequence');
            sequenceDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(sequenceText === null) ? sequenceText : "") + ": " +
                + (creditSlipDoc.PROVIDER_TRANS_ID ? creditSlipDoc.PROVIDER_TRANS_ID : "") + "</div>" +
                "</div>"
            creditSlipDiv.appendChild(sequenceDiv)

            let responseDiv = this._doc.createElement('div');
            responseDiv.id = 'responseDiv';
            let responseText = this.$translate.getText('Response');
            let responseMessage = creditSlipDoc.PROVIDER_RESPONSE_MESSAGE ? creditSlipDoc.PROVIDER_RESPONSE_MESSAGE : '';
            responseDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(responseText === null || responseText === undefined) ? responseText : "") + ": " +
                (creditSlipDoc.PROVIDER_RESPONSE_CODE ? creditSlipDoc.PROVIDER_RESPONSE_CODE + "/" + responseMessage : "") + "</div>" +
                "</div>"
            creditSlipDiv.appendChild(responseDiv)

            let approvalDiv = this._doc.createElement('div');
            approvalDiv.id = 'approvalDiv';
            let approvalText = this.$translate.getText('Approval');
            approvalDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(approvalText === null) ? approvalText : "") + ": " +
                (creditSlipDoc.CONFIRMATION_NUMBER ? creditSlipDoc.CONFIRMATION_NUMBER : "") + "</div></div>"

            creditSlipDiv.appendChild(approvalDiv)

            let entryDiv = this._doc.createElement('div');
            entryDiv.classList += ' tpl-body-div';
            entryDiv.id = 'entryDiv';
            let entryText = this.$translate.getText('Entry');
            entryDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(entryText === null) ? entryText : "") + ": " +
                (creditSlipDoc.ENTRY_METHOD ? creditSlipDoc.ENTRY_METHOD : "") +
                "</div></div>"

            entryDiv.classList += ' padding-bottom';
            entryDiv.classList += ' tpl-body-div';
            creditSlipDiv.appendChild(entryDiv)

            let checkTotalDiv = this._doc.createElement('div');
            checkTotalDiv.id = 'checkTotalDiv';
            let checkTotalText = this.$translate.getText('Amount');
            checkTotalDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(checkTotalText === null) ? checkTotalText : "") + ": " + "</div >" +
                "<div class='total-amount'>" + (creditSlipDoc.P_AMOUNT_WO_TIP ? Number(creditSlipDoc.P_AMOUNT_WO_TIP).toFixed(2) : "") +
                "</div></div>"

            checkTotalDiv.classList += ' padding-top';
            creditSlipDiv.appendChild(checkTotalDiv)

            let tipDiv = this._doc.createElement('div');
            tipDiv.id = 'tipDiv';
            let tipText = this.$translate.getText('Tip');
            let tipAmount;
            if (creditSlipDoc.TIP_AMOUNT !== undefined && creditSlipDoc.TIP_AMOUNT !== null) {
                tipAmount = creditSlipDoc.TIP_AMOUNT;
            }
            else {
                tipAmount = 0;
            }
            tipDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(tipText === null) ? tipText : "") + ": " + "</div >" +
                "<div class='total-amount'>" + (tipAmount ? Number(tipAmount).toFixed(2) : '0.00') +
                "</div></div>"
            creditSlipDiv.appendChild(tipDiv)

            let totalDiv = this._doc.createElement('div');
            totalDiv.id = 'totalDiv';
            let totalText = this.$translate.getText('Total');
            totalDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (totalText ? totalText : "") + ": " + "</div >" +
                "<div class='total-amount'>" + (creditSlipDoc.P_AMOUNT ? Number(creditSlipDoc.P_AMOUNT).toFixed(2) : "") + "</div></div>";
            creditSlipDiv.appendChild(totalDiv)

            //Add signature 

            if (docObjChosen.md.signature) {

                let signatureData = docObjChosen.md.signature;
                let signatureDiv = this._doc.createElement('div');
                signatureDiv.id = 'signatureDiv';
                signatureDiv.classList += " signature-container";

                let elementSVGDiv = this._doc.createElement('div');
                elementSVGDiv.id = 'elementSVGDiv'
                elementSVGDiv.classList += " signature-container";
                let newSVG = this._doc.createElement('div');
                newSVG.id = 'newSVG';

                elementSVGDiv.appendChild(newSVG)
                newSVG.outerHTML += `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id='svg' width='100%' height='100' transform='translate(0, 0)'  viewBox="0 0 500 150" ></svg>`
                let svgNode = elementSVGDiv.getElementsByTagName('svg')[0];
                svgNode.classList += " signature-container";

                elementSVGDiv.appendChild(svgNode);

                signatureDiv.appendChild(elementSVGDiv)

                let elementSVG = signatureDiv.getElementsByTagName('svg')[0];
                elementSVG.id = 'elementSVG';

                let path = this.makeSVG('path', { d: signatureData, version: "1.1", xmlns: "http://www.w3.org/2000/svg", stroke: "#06067f", 'stroke-width': "2", height: "auto", transform: 'translate(50,-40) scale(0.4,0.4)', 'stroke-linecap': "butt", fill: "none", 'stroke-linejoin': "miter" });
                path.setAttribute("width", "50%");
                path.setAttribute("height", "auto");

                elementSVG.setAttribute("width", "100");
                elementSVG.setAttribute("height", "auto");

                elementSVG.innerHTML = "";
                elementSVG.appendChild(path);
                elementSVG.setAttribute("width", "100%");
                elementSVG.setAttribute("height", "auto");

                elementSVGDiv.appendChild(elementSVG);
                creditSlipDiv.appendChild(signatureDiv)
            }
        }

        return creditSlipDiv;
    }

    makeSVG(tag, attrs) {
        var el = this._doc.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var k in attrs)
            el.setAttribute(k, attrs[k]);
        return el;
    }

}