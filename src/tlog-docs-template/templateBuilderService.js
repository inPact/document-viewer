import BillService from './billService';
import HeaderService from './headerService';
import EmvService from './emvService';
import AddTaxDataService from './addTaxDataService';
import VatTemplateService from './vatTemplateService';
import TlogDocsTranslateService from './tlogDocsTranslate';
import DeliveryNoteTransactionDataService from './deliveryNoteTransactionService';
import CreditSlipService from './creditSlipService';
import GiftCardSlipService from './giftCardSlipService'
import SignatureService from './signatureService'
import TlogDocsUtils from './tlogDocsUtils';

export default class TemplateBuilderService {
    constructor(options) {
        this._isUS;
        this._locale;
        this._configure(options);
        this._isGiftCardBill;
        this._isTaxExempt;

        this.$utils = new TlogDocsUtils();
        this.$translate = new TlogDocsTranslateService({ locale: this._locale });
        this.$billService = new BillService(options);
        this.$headerService = new HeaderService(options);
        this.$emvService = new EmvService(options);
        this.$vatTemplateService = new VatTemplateService(options);
        this.$creditSlipService = new CreditSlipService(options);
        this.$giftCardSlipService = new GiftCardSlipService(options);
        this.$deliveryNoteTransactionService = new DeliveryNoteTransactionDataService(options);
        this.$signatureService = new SignatureService();
        this.$addTaxData = new AddTaxDataService(options);
    }

    _configure(options) {
        if (options.locale) this._locale = options.locale;
        if (options.isUS !== undefined) this._isUS = options.isUS;

    }

    _createRootElement() {
        let rootElement = document.implementation.createHTMLDocument();
        return rootElement;
    }

    createHTMLFromPrintDATA(documentInfo, document, options = {}) {

        console.log('documentInfo: ')
        console.log(documentInfo)
        console.log('document: ')
        console.log(document)

        this._doc = this._createRootElement();
        this._docObj = documentInfo;
        this._docData = document;
        this._printData = this.$billService.resolvePrintData(document.printData, this._isUS);
        this._printData.isRefund = documentInfo.isRefund;
        let template = this.createDocTemplate(documentInfo, options);
        this._doc.body.appendChild(template);
        return (new XMLSerializer()).serializeToString(this._doc);
    }

    createDocTemplate(docObjChosen, options = {}) {
        this._excludeHeader = options.excludeHeader ? options.excludeHeader : false;
        var docTemplate = this._doc.createElement('div');
        docTemplate.id = 'docTemplate';
        docTemplate.classList.add('basicTemplate');

        if (this._locale == 'he-IL') {
            docTemplate.classList += ' rtl'
            docTemplate.classList.remove('ltr')
        }
        else {
            docTemplate.classList += ' ltr'
            docTemplate.classList.remove('rtl')
        }

        if (!this._excludeHeader) {
            var templateHeader = this.$headerService.createHeader(this._printData, this._doc, this._docObj, this._docData);
            templateHeader.classList += ' text-center';

            docTemplate.appendChild(templateHeader);
        }


        var checkInIL;
        if (this._locale == 'he-IL' && docObjChosen.documentType === 'check') {
            checkInIL = true;
        }

        this._isGiftCardBill = docObjChosen.isGiftCardBill ? true : false;
        this._isTaxExempt = this._printData.data.isTaxExempt;

        var isMediaExchange = (this._printData.variables.ORDER_TYPE === "MEDIAEXCHANGE");
        var isCreditSlip = ((docObjChosen.md && docObjChosen.type === 'creditCard' && !docObjChosen.isFullOrderBill && !docObjChosen.md.checkNumber && !checkInIL) || docObjChosen.documentType === 'creditSlip')

        var isGiftCardSlip = (docObjChosen.type === 'giftCard' && this._isUS);

        if (isMediaExchange && !isCreditSlip && !isGiftCardSlip) {
            var mediaExchangeDiv = this.createMediaExchange(this._printData, docObjChosen);
            docTemplate.appendChild(mediaExchangeDiv)
        }
        if (isCreditSlip !== null && isCreditSlip) {
            var tplCreditSlipTemplate = this.$creditSlipService.createCreditSlip(this._printData, docObjChosen, this._doc);
            docTemplate.appendChild(tplCreditSlipTemplate);
        }
        else if (isGiftCardSlip) {
            var tplGiftCardSlipTemplate = this.$giftCardSlipService.createGiftCardSlip(this._printData, docObjChosen, this._doc);
            docTemplate.appendChild(tplGiftCardSlipTemplate);
        }
        else {
            //create a general template content
            if (this._printData.variables.ORDER_TYPE.toUpperCase() !== "REFUND") {//in case the invoice is refund=> do not show the the tplOrderPaymentData div
                var tplOrderPaymentData = this.createOrderPaymentData(this._printData);
                tplOrderPaymentData.id = 'tplOrderPaymentData';
                tplOrderPaymentData.hasChildNodes() ? tplOrderPaymentData.classList += ' body-div' : '';
            }

            // var tplOrderPaymentData = createOrderPaymentData(_printData);
            var tplOrderTotals = this.createTotalsData(this._printData, this._isGiftCardBill, this._isTaxExempt);
            var tplOrderPayments = this.createPaymentsData(this._printData);

            // tplOrderPaymentData.id = 'tplOrderPaymentData';
            tplOrderTotals.id = 'tplOrderTotals';
            tplOrderPayments.id = 'tplOrderPayments';

            //adding styling to the template divs
            // tplOrderPaymentData.hasChildNodes() ? tplOrderPaymentData.classList += ' body-div' : '';
            tplOrderTotals.hasChildNodes() ? tplOrderTotals.classList += ' body-div tpl-body-div' : '';
            tplOrderPayments.hasChildNodes() ? tplOrderPayments.classList += ' body-div tpl-body-div' : '';

            //set body main divs
            if (this._printData.variables.ORDER_TYPE.toUpperCase() !== "REFUND") {//in case the invoice is refund=> do not show the the tplOrderPaymentData div
                docTemplate.appendChild(tplOrderPaymentData);
            }
            tplOrderTotals.hasChildNodes() ? docTemplate.appendChild(tplOrderTotals) : null;
            tplOrderPayments.hasChildNodes() ? docTemplate.appendChild(tplOrderPayments) : null;

            //if gift card
            if (this._isGiftCardBill) {
                if (this._isUS) {
                    var inclusiveTaxesDiv = this.$addTaxData.createInclusiveTaxFunc(this._printData, this._doc);
                    var exmemptTaxesDiv = this.$addTaxData.createTaxExemptFunc(this._printData, this._doc);

                    if (inclusiveTaxesDiv !== null) docTemplate.appendChild(inclusiveTaxesDiv)
                    if (exmemptTaxesDiv !== null) docTemplate.appendChild(exmemptTaxesDiv)
                }
            }

            //if tax exempt
            if (this._isTaxExempt) {
                if (this._isUS) {
                    var exmemptTaxesDiv = this.$addTaxData.createTaxExemptFunc(this._printData, this._doc);
                    if (exmemptTaxesDiv !== null) docTemplate.appendChild(exmemptTaxesDiv)
                }
            }

            if (this._printData.variables.CUSTOMER_MESSAGE) {
                var customerMessageDiv = this.createCustomerMessage(this._printData, this._doc);
                if (customerMessageDiv !== null) docTemplate.appendChild(customerMessageDiv)
            }
        }

        if (this._printData.data.isReturnOrder && this._docData.documentType === 'orderBill') {
            docTemplate.appendChild(this.createReturnOrderText(this._printData));
        }

        console.log('THe docType is: ');
        console.log(this._docData.documentType);

        if (isMediaExchange &&
            docObjChosen.isFullOrderBill &&
            this._printData.collections.PAYMENT_LIST &&
            this._printData.collections.PAYMENT_LIST.length > 0 &&
            this._printData.collections.PAYMENT_LIST.find(p => p.EMV !== undefined)) {
            let documentType = 'orderBill'
            docTemplate.appendChild(this.$emvService.createEmvTemplate(documentType, this._printData, this._doc));
        }
        else if (
            this._docData.documentType === 'invoice' &&
            this._printData.collections.CREDIT_PAYMENTS &&
            this._printData.collections.CREDIT_PAYMENTS.length > 0 &&
            this._printData.collections.CREDIT_PAYMENTS[0].EMV &&
            this._printData.collections.CREDIT_PAYMENTS[0].EMV.length > 0) {
            docTemplate.appendChild(this.$emvService.createEmvTemplate(this._docData.documentType, this._printData, this._doc));
        }

        return docTemplate;
    }

    createOrderPaymentData(printData) {
        var tplOrderPaymentData = this._doc.createElement('div');
        let data = this.$billService.resolveItems(printData.variables, printData.collections);
        tplOrderPaymentData.classList += ' tpl-body-div';
        var paymentDataDiv = this._doc.createElement('div');
        paymentDataDiv.id = "paymentDataDiv";
        paymentDataDiv.classList += ' padding-top';
        paymentDataDiv.classList += ' padding-bottom';

        tplOrderPaymentData.appendChild(paymentDataDiv);

        if (this._docObj && !(this._docData.documentType === "deliveryNote")) {
            this.fillItemsData(paymentDataDiv, data, printData);
            this.fillOthData(paymentDataDiv, data);
        }
        else if (this._docObj && this._docData.documentType === "deliveryNote") {
            this.fillItemsData(paymentDataDiv, data, printData);
            this.fillOthData(paymentDataDiv, data);
            var delNoteTransDiv = this.$deliveryNoteTransactionService.createDeliveryNoteTransactionData(printData, this._doc);
            tplOrderPaymentData.appendChild(delNoteTransDiv);
        }
        return tplOrderPaymentData
    }

    fillItemsData(htmlElement, data, printData) {

        if (!printData.isRefund) {
            data.items.forEach((item, index) => {

                //in case it is return order, we don't want to show return of item the did not cost anything
                if (!(data.isReturnOrder && this._docData.documentType === 'orderBill' && (!item.amount || item.amount === '0.00'))) {

                    var orderdOfferListExists = printData.collections.ORDERED_OFFERS_LIST.length > 0 ? true : false;
                    var offerListIndex = orderdOfferListExists && printData.collections.ORDERED_OFFERS_LIST[index] ? orderdOfferListExists && printData.collections.ORDERED_OFFERS_LIST[index] : null;
                    var offerUnits = offerListIndex ? offerListIndex.OFFER_UNITS : null;

                    var isWeightItem = offerUnits && offerUnits > 0 ? true : false;
                    var weightWordTranslate = this.$translate.getText('weight');

                    var weightUnit = printData.variables.BASIC_WEIGHT_UOM;
                    var weightUnitTranslate = this.$translate.getText(weightUnit)
                    var itemDiv = this._doc.createElement('div');
                    if (item.isOffer) {
                        itemDiv.classList.add("bold");
                        item.space = "";
                    }
                    else if (!item.isOffer) {
                        itemDiv.classList.add("itemDiv");
                        item.qty = '&nbsp;&nbsp;';
                        item.space = "&emsp;";
                    }
                    itemDiv.innerHTML = "<div class='itemDiv'>" +
                        "<div class='item-qty'>" + (item.qty ? item.qty : " ") + "</div>" + " " +
                        "<div class='item-name'>" + item.space + "" + (item.name ? item.name : "") + "</div>" + " " +
                        "<div class='total-amount " + this.isNegative(item.amount) + "'>" + (item.amount ? item.amount : "") + "</div>" +
                        "</div>"

                    var weightDiv = this._doc.createElement('div');
                    weightDiv.classList += "weightDiv";
                    if (isWeightItem) {
                        weightDiv.innerHTML = "<div class='itemDiv'>" +
                            "<div class='item-qty'>" + " " + "</div>" + " " +
                            "<div class='item-name'>" + item.space + "" + (weightWordTranslate) + " (" + weightUnitTranslate + ")" + "</div>" + " " +
                            "<div class='total-amount'>" + (offerUnits ? offerUnits : "") + "</div>" +
                            "</div>"

                        itemDiv.appendChild(weightDiv);
                    }
                    htmlElement.appendChild(itemDiv);
                }
            })
        }
    }

    fillOthData(htmlElement, data) {
        data.oth.forEach(othItem => {
            var othItemDiv = this._doc.createElement('div');
            if (othItem.isOffer) {
                othItemDiv.classList.add("bold");
                othItem.space = "";
            }
            else if (!othItem.isOffer) {
                othItem.id = "singleOthDiv"
                othItem.qty = '&nbsp;&nbsp;';
                othItem.space = "&emsp;";
            }

            othItemDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='item-qty'>" + (othItem.qty ? othItem.qty : " ") + "</div>" + " " +
                "<div class='item-name'>" + othItem.space + (othItem.name ? othItem.name : "") + "</div>" + " " +
                "<div class='total-amount " + this.isNegative(othItem.amount) + "'>" + (othItem.amount ? othItem.amount : "") + "</div>" +
                "</div>"

            htmlElement.appendChild(othItemDiv);

        })
    }

    createCreditTemplate(printData) {
        var CreditTemplate = this._doc.createElement('div');
        CreditTemplate.id = "CreditTemplate";
        var CreditHeaderDiv = this._doc.createElement('div');
        CreditHeaderDiv.id = "CreditHeaderDiv";
        let credPayments = {}
        if (printData.collections.CREDIT_PAYMENTS && printData.collections.CREDIT_PAYMENTS.length > 0) {
            credPayments = printData.collections.CREDIT_PAYMENTS[0];

            var retrunedCredFromText = null;
            var paidCredFromText = null;
            var issuer = credPayments.ISSUER
            var paymentAmount = credPayments.P_AMOUNT;
            //check if refun, if does   refund text
            if (printData.isRefund) {
                var retrunedCredFromTranslate = this.$translate.getText('RETURNED_IN_CREDIT_FROM')
                CreditHeaderDiv.classList.add("bold");
                retrunedCredFromText = retrunedCredFromTranslate;
                CreditHeaderDiv.innerHTML = "<div class='itemDiv'>" +
                    "<div class='total-name'>" + (!(retrunedCredFromText === null) ? retrunedCredFromText : "") + " " + (issuer ? issuer : "") + "</div>" + " " +
                    "<div class='total-amount " + this.isNegative(paymentAmount) + "'>" + (paymentAmount ? Number(paymentAmount).toFixed(2) : "") + "</div>" +
                    "</div>"
                CreditTemplate.appendChild(CreditHeaderDiv);

            }
            else {
                var paidCredFromTranslate = this.$translate.getText('PAID_IN_CREDIT_FROM')
                CreditHeaderDiv.classList.add("bold");
                paidCredFromText = paidCredFromTranslate;
                CreditHeaderDiv.innerHTML = "<div class='itemDiv'>" +
                    "<div class='total-name'>" + (!(paidCredFromText === null) ? paidCredFromText : "") + " " + (issuer ? issuer : "") + "</div>" + " " +
                    "<div class='total-amount " + this.isNegative(paymentAmount) + "'>" + (paymentAmount ? Number(paymentAmount).toFixed(2) : "") + "</div>" +
                    "</div>"
                CreditTemplate.appendChild(CreditHeaderDiv);

            }


            var cashBackText = this.$translate.getText(printData.variables.CHANGE ? 'TOTAL_CASHBACK' : "");
            var cashBackDiv = this._doc.createElement('div');
            if (printData.collections.PAYMENT_LIST[0].P_CHANGE) {
                cashBackDiv.innerHTML = "<div class='changeDiv padding-bottom border-bottom'>" +
                    "<div class='total-name'>" + (cashBackText ? cashBackText : " ") + "</div>" +
                    "<div class='total-amount'>" + (printData.collections.PAYMENT_LIST[0].P_CHANGE ? this.twoDecimals(printData.collections.PAYMENT_LIST[0].P_CHANGE) : " ") + "</div>"
                    + "</div >"

                CreditHeaderDiv.appendChild(cashBackDiv);
            }
            else {
                cashBackDiv.innerHTML = "<div class='changeDiv padding-bottom border-bottom'></div>"
            }

            var creditDataTemplate = this.createCreditDataTemplate(credPayments, printData)
            CreditTemplate.appendChild(creditDataTemplate)

        }
        return CreditTemplate;
    }

    createCreditDataTemplate(creditData, printData) {
        var creditDataDiv = this._doc.createElement('div');
        creditDataDiv.id = "creditDataDiv";
        if (creditData) {

            var lastFourText = this.$translate.getText(creditData.LAST_4 ? 'LAST_4' : "");
            var transactTimeText = this.$translate.getText(creditData.PROVIDER_PAYMENT_DATE ? 'TRANSACTION_TIME' : "");
            var transactNumText = this.$translate.getText(creditData.PROVIDER_TRANS_ID ? 'TRANSACTION_NO' : "");
            var approvalText = this.$translate.getText(creditData.CONFIRMATION_NUMBER ? 'APPROVAL_NO' : "");


            var lastFourDiv = this._doc.createElement('div');
            if (lastFourText) {
                lastFourDiv.innerHTML = "<div class='itemDiv'>" +
                    "<div class='total-name'>" + (lastFourText ? lastFourText : " ") + "</div>"
                    + " " + "<div class='number-data'>" + (creditData.LAST_4 ? creditData.LAST_4 : " ") + "</div>" + "</div>"

            }
            creditDataDiv.appendChild(lastFourDiv);

            var dateTimeStr = creditData.PROVIDER_PAYMENT_DATE;
            var dateTimeResult;
            var transactionTimeDiv = this._doc.createElement('div')
            if (this._isUS) dateTimeResult = this.formatDateUS(dateTimeStr);
            else if (!this._isUS) {
                dateTimeResult = this.formatDateIL(dateTimeStr);
            }
            transactionTimeDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (transactTimeText ? transactTimeText : "") + "</div>" + "<div class='number-data'>" + (transactTimeText ? dateTimeResult : "") + "</div>" +
                "</div>"

            creditDataDiv.appendChild(transactionTimeDiv);

            var transactNumDiv = this._doc.createElement('div');
            if (creditData.PROVIDER_TRANS_ID) {
                transactNumDiv.innerHTML = "<div class='itemDiv'>" +
                    "<div class='total-name'>" + (transactNumText ? transactNumText : " ") + "</div>" +
                    "<div class='number-data'>" + (creditData.PROVIDER_TRANS_ID ? creditData.PROVIDER_TRANS_ID : " ") + "</div>" + "</div>"
            }
            creditDataDiv.appendChild(transactNumDiv);

            var approvalDiv = this._doc.createElement('div');
            if (creditData.CONFIRMATION_NUMBER) {
                approvalDiv.innerHTML = "<div class='itemDiv'>" +
                    "<div class='total-name'>" + (approvalText ? approvalText : " ") + "</div>" +
                    "<div class='number-data'>" + (creditData.CONFIRMATION_NUMBER ? creditData.CONFIRMATION_NUMBER : " ") + "</div>" + "</div>"
            }
            creditDataDiv.appendChild(approvalDiv);

        }

        return creditDataDiv
    }

    createTotalsData(printData, isGiftCardBill, isTaxExempt) {
        var tplOrderTotals = this._doc.createElement('div');
        tplOrderTotals.id = 'tplOrderTotals';
        tplOrderTotals.hasChildNodes() ? tplOrderTotals.classList += ' tpl-body-div' : '';
        var taxDataDiv = this.$addTaxData.addTaxDataFunc(printData, this._doc, this._isGiftCardBill);

        if (taxDataDiv !== null && !isGiftCardBill && !isTaxExempt) { tplOrderTotals.appendChild(taxDataDiv); }


        var taxDataDiv = this.$addTaxData.addTaxDataFunc(printData, this._doc, this._isGiftCardBill);
        if (taxDataDiv !== null) {
            tplOrderTotals.appendChild(taxDataDiv);
        }

        if (this._docObj && (this._docData.documentType ===
            ('invoice' || 'CreditCardPayment' || 'CreditCardRefund' || 'CashPayment' || 'GiftCard' || 'CashRefund' || 'ChequePayment' || 'ChequeRefund'))) {
            var vatTemplateDiv = this.$vatTemplateService.createVatTemplate(printData, this._doc);
            tplOrderTotals.appendChild(vatTemplateDiv);
        }
        else if (this._docObj && (this._docData.documentType === 'deliveryNote')) {
            return tplOrderTotals
        }
        else {
            var OrderTotalsDiv = this._doc.createElement('div');
            OrderTotalsDiv.id = "OrderTotalsDiv";
            tplOrderTotals.appendChild(OrderTotalsDiv);
            OrderTotalsDiv.hasChildNodes() ? OrderTotalsDiv.classList += " tpl-body-div" : '';

            this.fillOrderTotals(OrderTotalsDiv, printData);
        }
        return tplOrderTotals
    }

    fillOrderTotals(htmlElement, printData) {
        if (printData.data.totals.length > 0) {

            // if (!_isUS) {
            printData.data.totals.forEach(total => {
                var isCheckTotal = total.name === 'Check Total';

                var totalDiv = this._doc.createElement('div');
                if (total.type === 'exclusive_tax') {
                    totalDiv.innerHTML = "<div class='itemDiv'>" +
                        "<div class='total-name'>" + "&nbsp;&nbsp;" + (total.name ? total.name : " ") + " " + (total.rate ? total.rate + "%" : " ") + "</div>" + " " +
                        "<div class='total-amount " + this.isNegative(total.amount) + "'>" + (total.amount ? this.twoDecimals(total.amount) : " ") + "</div>" + "</div>"
                }
                else if (total.type !== 'exclusive_tax') {
                    totalDiv.innerHTML = "<div class='itemDiv " + (isCheckTotal ? " bold" : '') + "'>" +
                        "<div class='total-name'>" + (total.name ? total.name : " ") + "</div>" + " " +
                        "<div class='total-amount " + this.isNegative(total.amount) + "'>" + (total.amount ? this.twoDecimals(total.amount) : " ") + "</div>" +
                        "</div>"
                }

                htmlElement.appendChild(totalDiv);
            })
        }
    }

    createPaymentsData(printData) {

        var tplOrderPaymentsDiv = this._doc.createElement('div');
        tplOrderPaymentsDiv.id = 'tplOrderPayments';

        if (this._docObj && this._docData.documentType === "deliveryNote") {
            return tplOrderPaymentsDiv;
        }

        else if (this._docObj && this._docData.documentType === "invoice") {
            if (this._docObj.docPaymentType === "CreditCardPayment" || this._docObj.docPaymentType === "CreditCardRefund") {
                var creditPaymentDiv = this.createCreditTemplate(printData);
                tplOrderPaymentsDiv.appendChild(creditPaymentDiv);

                if (this._docObj.md && !this._isUS) {
                    var signatureDiv = this._doc.createElement('div');
                    signatureDiv.id = 'signatureDiv';
                    tplOrderPaymentsDiv.appendChild(this.$signatureService.getSignature(this._docObj, signatureDiv, this._doc));
                }
            }
            else if (this._docObj.docPaymentType === ("GiftCard")) {
                var giftCardPayment = this.createGiftCardDetails(printData);
                tplOrderPaymentsDiv.appendChild(giftCardPayment);
            }
            else if (this._docObj.docPaymentType === "CashPayment" || this._docObj.docPaymentType === "CashRefund") {
                var cashPayment = this.createCashPaymentFooter(printData);
                tplOrderPaymentsDiv.appendChild(cashPayment);
            }
            else if (this._docObj.docPaymentType === "ChequePayment" || this._docObj.docPaymentType === "ChequeRefund") {
                var chequePayment = this.createChequePaymentFooter(printData);
                tplOrderPaymentsDiv.appendChild(chequePayment);
            }

        }
        else {
            var OrderPaymentsDiv = this.fillPaymentsData(printData);
            OrderPaymentsDiv.id = "OrderPaymentsDiv";
            tplOrderPaymentsDiv.appendChild(OrderPaymentsDiv);
        }
        return tplOrderPaymentsDiv
    }

    fillPaymentsData(printData) {
        var OrderPaymentsDiv = this._doc.createElement('tplOrderPayments');
        OrderPaymentsDiv.id = 'OrderPaymentsDiv';

        if (printData.data.payments.length > 0) {
            printData.data.payments.forEach(payment => {
                var paymentDiv = this._doc.createElement('div');
                if (payment) {
                    paymentDiv.innerHTML =
                        "<div class=" + (payment.type === 'change' ? 'changeDiv' : 'itemDiv') + ">" +
                        "<div class='total-name'>" + (payment.name ? payment.name : " ") + "</div>" + " " +
                        "<div class='total-amount " + this.isNegative(payment.amount) + "'>" + (payment.amount ? payment.amount : " ") + "</div>" +
                        "</div>"
                    OrderPaymentsDiv.appendChild(paymentDiv);
                }
                if (payment.holderName) {
                    var holderNameDiv = this._doc.createElement('div');
                    holderNameDiv.classList += ' holder-name';
                    holderNameDiv.innerHTML = "&nbsp;" + payment.holderName;
                    OrderPaymentsDiv.appendChild(holderNameDiv);
                }

            })
        }

        return OrderPaymentsDiv;
    }

    createGiftCardDetails(printData) {

        var giftCardDiv = this._doc.createElement('div');
        //giftCard Amount div
        var paidGiftCardText = this.$translate.getText('PAID_GIFTCARD');
        var pAmount = printData.collections.GIFT_CARD_PAYMENTS[0].P_AMOUNT ? Number(printData.collections.GIFT_CARD_PAYMENTS[0].P_AMOUNT).toFixed(2) : '';
        var giftCardPaidDiv = this._doc.createElement('div')
        giftCardPaidDiv.innerHTML = "<div class='itemDiv'>" +
            "<div class='total-name'>" + (paidGiftCardText ? paidGiftCardText : " ") + "</div>" +
            "<div class='total-amount'>" + pAmount + "</div></div>"

        giftCardDiv.appendChild(giftCardPaidDiv);

        //giftcard Num div
        var giftCardNum = this.$translate.getText('CARD_NO');
        var cardNum = printData.collections.GIFT_CARD_PAYMENTS[0].CARD_NUMBER ? printData.collections.GIFT_CARD_PAYMENTS[0].CARD_NUMBER : '';
        var giftCardNumDiv = this._doc.createElement('div')
        giftCardNumDiv.id = 'giftCardNumDiv';
        giftCardNumDiv.innerHTML = "<div class='itemDiv'>" +
            "<div class='total-name'>" + (giftCardNum ? (giftCardNum + ": ") : " ") + "</div>" +
            "<div class='number-data'>" + cardNum + "</div>" + "</div>"

        giftCardDiv.appendChild(giftCardNumDiv);

        //transaction Num div
        var transactionNumText = this.$translate.getText('TRANSACTION_NO');
        var transactNum = printData.collections.GIFT_CARD_PAYMENTS[0].PROVIDER_TRANS_ID ? printData.collections.GIFT_CARD_PAYMENTS[0].PROVIDER_TRANS_ID : '';
        var transactNumDiv = this._doc.createElement('div');
        transactNumDiv.id = 'transactNum'
        transactNumDiv.innerHTML = "<div class='itemDiv'>" +
            "<div class='total-name'>" + (transactionNumText ? (transactionNumText + ": ") : " ") + "</div>" +
            "<div class='number-data'>" + transactNum + "</div>" + "</div>"

        giftCardDiv.appendChild(transactNumDiv);

        return giftCardDiv;

    }

    createMediaExchange(printData) {
        var printMessage;
        var pName;
        var cardNumber;
        var pAmount;
        var balanceAmount;

        if (printData.collections.PAYMENT_LIST && printData.collections.PAYMENT_LIST.length > 0) {
            printData.collections.PAYMENT_LIST.forEach(payment => {
                if (payment.P_TENDER_TYPE === 'giftCard') {
                    printMessage = payment.PRINT_MESSAGE.replace(/\n/ig, '<br/>');
                    pName = payment.P_NAME;
                    cardNumber = payment.CARD_NUMBER;
                    pAmount = payment.P_AMOUNT;
                    balanceAmount = payment.BALANCE_AMOUNT;
                }
            });
        }

        var mediaExchangeDiv = this._doc.createElement('div');
        mediaExchangeDiv.id = 'mediaExchangeDiv';

        //set texts for the divs
        var giftCardText = pName;
        var cardNumberText = this.$translate.getText('card_number');
        var amountText = this.$translate.getText('amount');
        var balanceText = this.$translate.getText('Balance');

        //create div to append
        var pNameDiv = this._doc.createElement('div');
        var amountDiv = this._doc.createElement('div');
        var cardNumberDiv = this._doc.createElement('div');
        var balanceDiv = this._doc.createElement('div');
        var printMsgDiv = this._doc.createElement('div');

        if (pName) {
            pNameDiv.innerHTML = "<div class='padding-top bold'>" + giftCardText + "</div>"
            mediaExchangeDiv.appendChild(pNameDiv);
        }
        if (cardNumber) {
            cardNumberDiv.innerHTML = "<div class='bold'>" + cardNumberText + ": " + cardNumber + "</div>"
            mediaExchangeDiv.appendChild(cardNumberDiv);
        }
        if (pAmount) {
            amountDiv.innerHTML = "<div class='bold'>" + amountText + ": " + this.twoDecimals(pAmount) + "</div>"
            mediaExchangeDiv.appendChild(amountDiv);
        }
        if (balanceAmount) {
            balanceDiv.innerHTML = "<div class='bold'>" + balanceText + ": " + this.twoDecimals(balanceAmount) + "</div>"
            mediaExchangeDiv.appendChild(balanceDiv);
        }
        if (printMessage) {
            printMsgDiv.innerHTML = "<div class='bold'>" + printMessage + "</div>"
            mediaExchangeDiv.appendChild(printMsgDiv);
        }

        return mediaExchangeDiv;
    }

    createCashPaymentFooter(printData) {
        var cashDiv = this._doc.createElement('div');
        cashDiv.id = 'cashDiv'
        //cash paid or returned  div
        var cashPaidText = this.$translate.getText('PAID_CASH');

        var cashReturnedText = this.$translate.getText('RETURNED_CASH');

        var pAmount = printData.collections.PAYMENT_LIST[0].P_AMOUNT ? printData.collections.PAYMENT_LIST[0].P_AMOUNT : '';
        var cashPaidDiv = this._doc.createElement('div')
        cashPaidDiv.innerHTML = "<div class='itemDiv'>" +
            "<div class='total-name'>" + (!printData.isRefund ? cashPaidText : cashReturnedText) + "</div>" +
            "<div class='total-amount " + this.isNegative(pAmount) + "'>" + this.twoDecimals(pAmount) + "</div>" +
            "</div>"

        cashDiv.appendChild(cashPaidDiv);

        //Change div
        if (printData.collections.PAYMENT_LIST[0].P_CHANGE) {
            var changeText = this.$translate.getText('TOTAL_CASHBACK');
            var pChange = printData.collections.PAYMENT_LIST[0].P_CHANGE ? Number(printData.collections.PAYMENT_LIST[0].P_CHANGE).toFixed(2) : '';
            var transactNumDiv = this._doc.createElement('div')
            transactNumDiv.innerHTML = "<div class='changeDiv'>" +
                "<div class='total-name'>" + (changeText ? changeText : '') + "</div>" +
                "<div class='total-amount " + this.isNegative(pChange) + "'>" + this.twoDecimals(pChange) + "</div>" +
                "</div>"

            cashDiv.appendChild(transactNumDiv);
        }

        return cashDiv;
    }

    createChequePaymentFooter(printData) {
        var chequeDiv = this._doc.createElement('div');
        chequeDiv.id = 'chequeDiv';

        var chequePaidText = this.$translate.getText('PAID_CHEQUE');
        var chequeReturnedText = this.$translate.getText('RETURNED_CHEQUE');


        var pAmount = printData.collections.PAYMENT_LIST[0].P_AMOUNT ? printData.collections.PAYMENT_LIST[0].P_AMOUNT : '';
        var chequePaidDiv = this._doc.createElement('div')
        chequePaidDiv.innerHTML = "<div class='itemDiv'>" +
            "<div class='total-name'>" + (!printData.isRefund ? chequePaidText : chequeReturnedText) + "</div>" +
            "<div class='total-amount " + this.isNegative(pAmount) + "'>" + this.twoDecimals(pAmount) + "</div>" +
            "</div>"

        chequeDiv.appendChild(chequePaidDiv);

        //Change div
        if (printData.collections.PAYMENT_LIST[0].P_CHANGE) {
            var changeText = this.$translate.getText('TOTAL_CASHBACK');
            var pChange = printData.collections.PAYMENT_LIST[0].P_CHANGE ? Number(printData.collections.PAYMENT_LIST[0].P_CHANGE).toFixed(2) : '';
            var tpChangeNumDiv = this._doc.createElement('div')
            tpChangeNumDiv.className += 'tpChangeNumDiv'
            tpChangeNumDiv.innerHTML = "<div class='changeDiv'>" +
                "<div class='total-name'>" + (changeText ? changeText : '') + "</div>" +
                "<div class='total-amount " + this.isNegative(pChange) + "'>" + this.twoDecimals(pChange) + "</div>" +
                "</div>"

            chequeDiv.appendChild(tpChangeNumDiv);
        }

        return chequeDiv;
    }


    createReturnOrderText(printData) {
        var returnOrderDiv = this._doc.createElement('div')

        var isReturnOrderTextDiv = this._doc.createElement('div');
        isReturnOrderTextDiv.id = "isReturnOrderTextDiv";
        isReturnOrderTextDiv.innerHTML = "<div class= bigBold>" + (this.$translate.getText('RETURN_TRANSACTION')) + "</div>";
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

    createCustomerMessage(printData, doc) {
        if (printData.variables.CUSTOMER_MESSAGE) {
            var customerMessage = this.breakCustomerMessageFilter(printData.variables.CUSTOMER_MESSAGE);
            var customerMessageDataDiv = doc.createElement('div');
            customerMessageDataDiv.innerHTML = "<div class='customerMessage'>" + customerMessage + "</div>"

            return customerMessageDataDiv;
        }
        else return null;

    }




    breakCustomerMessageFilter(str) {
        if (!str) return '';
        return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br\/>$2');
    }
    //create svg function
    makeSVG(tag, attrs) {
        var el = this._doc.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var k in attrs)
            el.setAttribute(k, attrs[k]);
        return el;
    }

    twoDecimals(number) {
        return this.$utils.twoDecimals(number);
    }

    //function for appending multiple children
    // appendChildren(target, array) {
    //     var divForAppending = this._doc.createElement('div');
    //     var length = array.length;
    //     if (length > 0) {
    //         array.forEach(element => {
    //             divForAppending.appendChild(element);
    //         })
    //     }
    //     return divForAppending;
    // }

    // orderWordsByLocale(input1, input2, input3) {
    //     let htmlString;
    //     if (this._isUS) {
    //         htmlString = "<span>" + input2 + "</span>" + "&nbsp;" + "<span>" + input1 + "</span>" + "&nbsp;" + " <span> #" + input3 + "</span >"
    //     } else {
    //         htmlString = "<span>" + input1 + "</span>" + "&nbsp;" + "<span>" + input2 + "</span> " + "&nbsp;" + " <span> #" + input3 + "</span >"

    //     }

    //     return htmlString;
    // }



    isNegative(amount) {
        var intAmount = parseInt(amount);
        return intAmount < 0 ? 'negative' : "";

    }

    formatDateUS(stringDate) {
        var date = new Date(stringDate);
        return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear() + " " + (date.getHours() > 12 ? (date.getHours() - 12) : date.getHours()) + ":" +
            ((date.getMinutes() > 9) ? date.getMinutes() : "0" + date.getMinutes()) + " " + (date.getHours() > 12 ? "PM" : "AM");
    }

    formatDateIL(stringDate) {
        var date = new Date(stringDate);
        return ((date.getHours() > 9) ? date.getHours() : "0" + date.getHours()) + ":" + ((date.getMinutes() > 9) ? date.getMinutes() : "0" + date.getMinutes()) + " " +
            date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + " ";
    }

}
