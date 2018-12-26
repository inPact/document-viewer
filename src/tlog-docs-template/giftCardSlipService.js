import TlogDocsUtils from './tlogDocsUtils';
import TlogDocsTranslateService from './tlogDocsTranslate';
import SignatureService from './signatureService';

export default class GiftCardSlipService {

    constructor(options = {}) {
        this._options = {};
        this.$translate = new TlogDocsTranslateService(options);
        this.$utils = new TlogDocsUtils();
        this.$signatureService = new SignatureService();
        this._locale;
        this._isUS;
        this._doc;
        this.configure(options)

    }
    configure(options) {
        if (options.locale) this._locale = options.locale;
        if (options.isUS) this._isUS = options.isUS;

    }
    createGiftCardSlip(printData, docObjChosen, doc) {
        this._doc = doc;
        let giftCardSlipDiv = this._doc.createElement('div');
        giftCardSlipDiv.id = 'giftCardSlipDiv';

        let giftCardSlipDoc;
        if (printData.collections.PAYMENT_LIST && printData.collections.PAYMENT_LIST.length > 0) {
            printData.collections.PAYMENT_LIST.forEach(payment => {
                if (payment.P_TENDER_TYPE === 'giftCard' &&
                    payment.P_ID === docObjChosen.md.paymentId
                ) {
                    giftCardSlipDoc = payment;
                }
            })
        }

        if (giftCardSlipDoc) {
            let transactionTypeDiv = this._doc.createElement('div');
            transactionTypeDiv.id = 'transactionTypeDiv';
            let TransactionTypeText = this.$translate.getText('TransactionType');
            transactionTypeDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(TransactionTypeText === null) ? TransactionTypeText : "") + ": "
                + (giftCardSlipDoc.TRANS_TYPE ? giftCardSlipDoc.TRANS_TYPE : "") + "</div></div>"

            transactionTypeDiv.classList += ' padding-top';
            giftCardSlipDiv.appendChild(transactionTypeDiv);

            let cardTypeDiv = this._doc.createElement('div');
            cardTypeDiv.id = 'cardTypeDiv';
            let cardTypeText = this.$translate.getText('CardType');
            if (giftCardSlipDoc.CARD_TYPE) {
                cardTypeDiv.innerHTML = "<div class='itemDiv'>" +
                    "<div class='total-name'>" + (!(cardTypeText === null) ? cardTypeText : "") + ": "
                    + (giftCardSlipDoc.CARD_TYPE ? giftCardSlipDoc.CARD_TYPE : "") + "</div></div>"
                giftCardSlipDiv.appendChild(cardTypeDiv)
            }

            let cardNumDiv = this._doc.createElement('div');
            cardNumDiv.id = 'cardNumDiv';
            let cardNumText = this.$translate.getText('CardNumber');
            cardNumDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(cardNumText === null) ? cardNumText : "") + ": " + (giftCardSlipDoc.CARD_NUMBER_MASKED ? giftCardSlipDoc.CARD_NUMBER_MASKED : "XXXX-" + giftCardSlipDoc.LAST_4) +
                "</div></div>"

            giftCardSlipDiv.appendChild(cardNumDiv)

            if (giftCardSlipDoc.CUSTOMER_NAME) {
                let cardHolderDiv = this._doc.createElement('div');
                cardHolderDiv.id = 'cardHolderDiv';
                let cardHolderText = this.$translate.getText('CardHolder');
                cardHolderDiv.innerHTML = "<div class='itemDiv'>" +
                    (!(cardHolderText === null) ? cardHolderText : "") + ": " + (giftCardSlipDoc.CUSTOMER_NAME ? giftCardSlipDoc.CUSTOMER_NAME : "") +
                    "</div></div>"
                giftCardSlipDiv.appendChild(cardHolderDiv)
            }


            let dateTimeStr = giftCardSlipDoc.PROVIDER_PAYMENT_DATE;
            let dateTimeResult;
            let transactTimeText = this.$translate.getText('transactTimeText');
            let giftCardSlipTimeDiv = this._doc.createElement('div')
            if (this._isUS) dateTimeResult = this.$utils.formatDateUS(dateTimeStr);
            else if (!this._isUS) {
                dateTimeResult = this.$utils.formatDateIL(dateTimeStr);
            }
            giftCardSlipTimeDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (transactTimeText ? transactTimeText : "") + ": " + (transactTimeText ? dateTimeResult : "") + "</div>" +
                "</div>";

            giftCardSlipTimeDiv.classList += ' padding-bottom';
            giftCardSlipTimeDiv.classList += ' tpl-body-div';

            giftCardSlipDiv.appendChild(giftCardSlipTimeDiv);

            let merchantDiv = this._doc.createElement('div');
            merchantDiv.id = 'merchantDiv';
            let merchantText = this.$translate.getText('Merchant');
            merchantDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(merchantText === null) ? merchantText : "") + ": " + (giftCardSlipDoc.MERCHANT_NUMBER ? giftCardSlipDoc.MERCHANT_NUMBER : "") +
                "</div></div>";
            merchantDiv.classList += ' padding-top';

            giftCardSlipDiv.appendChild(merchantDiv)


            let sequenceDiv = this._doc.createElement('div');
            sequenceDiv.id = 'sequenceDiv';
            let sequenceText = this.$translate.getText('Sequence');
            sequenceDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(sequenceText === null) ? sequenceText : "") + ": " +
                + (giftCardSlipDoc.PROVIDER_TRANS_ID ? giftCardSlipDoc.PROVIDER_TRANS_ID : "") + "</div>" +
                "</div>"
            giftCardSlipDiv.appendChild(sequenceDiv)

            let responseDiv = this._doc.createElement('div');
            responseDiv.id = 'responseDiv';
            let responseText = this.$translate.getText('Response');
            let responseMessage = giftCardSlipDoc.PROVIDER_RESPONSE_MESSAGE ? giftCardSlipDoc.PROVIDER_RESPONSE_MESSAGE : '';
            responseDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(responseText === null || responseText === undefined) ? responseText : "") + ": " +
                (giftCardSlipDoc.PROVIDER_RESPONSE_CODE ? giftCardSlipDoc.PROVIDER_RESPONSE_CODE + "/" + responseMessage : "") + "</div>" +
                "</div>"
            giftCardSlipDiv.appendChild(responseDiv)

            let approvalDiv = this._doc.createElement('div');
            approvalDiv.id = 'approvalDiv';
            let approvalText = this.$translate.getText('Approval');
            approvalDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(approvalText === null) ? approvalText : "") + ": " +
                (giftCardSlipDoc.CONFIRMATION_NUMBER ? giftCardSlipDoc.CONFIRMATION_NUMBER : "") + "</div></div>"

            giftCardSlipDiv.appendChild(approvalDiv)

            let entryDiv = this._doc.createElement('div');
            entryDiv.classList += ' tpl-body-div';
            entryDiv.id = 'entryDiv';
            let entryText = this.$translate.getText('Entry');
            entryDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(entryText === null) ? entryText : "") + ": " +
                (giftCardSlipDoc.ENTRY_METHOD ? giftCardSlipDoc.ENTRY_METHOD : "") +
                "</div></div>"

            entryDiv.classList += ' padding-bottom';
            entryDiv.classList += ' tpl-body-div';
            giftCardSlipDiv.appendChild(entryDiv)

            let checkTotalDiv = this._doc.createElement('div');
            checkTotalDiv.id = 'checkTotalDiv';
            let checkTotalText = this.$translate.getText('Amount');
            checkTotalDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(checkTotalText === null) ? checkTotalText : "") + ": " + "</div >" +
                "<div class='total-amount'>" + (giftCardSlipDoc.P_AMOUNT_WO_TIP ? Number(giftCardSlipDoc.P_AMOUNT_WO_TIP).toFixed(2) : "") +
                "</div></div>"

            checkTotalDiv.classList += ' padding-top';
            giftCardSlipDiv.appendChild(checkTotalDiv)

            let tipDiv = this._doc.createElement('div');
            tipDiv.id = 'tipDiv';
            let tipText = this.$translate.getText('Tip');
            let tipAmount;
            if (giftCardSlipDoc.TIP_AMOUNT !== undefined && giftCardSlipDoc.TIP_AMOUNT !== null) {
                tipAmount = giftCardSlipDoc.TIP_AMOUNT;
            }
            else {
                tipAmount = 0;
            }
            tipDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(tipText === null) ? tipText : "") + ": " + "</div >" +
                "<div class='total-amount'>" + (tipAmount ? Number(tipAmount).toFixed(2) : '0.00') +
                "</div></div>"
            giftCardSlipDiv.appendChild(tipDiv)

            let totalDiv = this._doc.createElement('div');
            totalDiv.id = 'totalDiv';
            let totalText = this.$translate.getText('Total');
            totalDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (totalText ? totalText : "") + ": " + "</div >" +
                "<div class='total-amount'>" + (giftCardSlipDoc.P_AMOUNT ? Number(giftCardSlipDoc.P_AMOUNT).toFixed(2) : "") + "</div></div>";
            giftCardSlipDiv.appendChild(totalDiv)

            //Add signature 
            if (docObjChosen.md.signature) {

                var signatureArea = this._doc.createElement('div');
                signatureArea.id = 'signatureArea';
                signatureArea.className += ' item-div';

                giftCardSlipDiv.appendChild(signatureArea);
                giftCardSlipDiv.appendChild(this.$signatureService.getSignature(docObjChosen, signatureArea, this._doc));

            }
            
        }

        return giftCardSlipDiv;
    }

}