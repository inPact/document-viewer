// 'use strict'
// const $translate = require('./tlogDocsTranslate');
// const $addTaxData = require('./addTaxDataService');
// const $createCreditSlipService = require('./createCreditSlipService');
// const $createVatTemplateService = require('./createVatTemplateService');
// const $deliveryNoteTransactionService = require('./deliveryNoteTransactionService');
// const $billService = require('./deliveryNoteTransactionService')

import BillService from './billService';
import AddTaxDataService from './addTaxDataService';
import CreateVatTemplateService from './createVatTemplateService';
import TlogDocsTranslateService from './tlogDocsTranslate';
import DeliveryNoteTransactionDataService from './deliveryNoteTransactionService';
import CreateCreditSlipService from './createCreditSlipService';

// let TemplateBuilderService = (function () {
export default class TemplateBuilderService {

    // var $translate;
    // var $utils;
    // var $addTaxData;
    // var $createCreditSlipService;
    // var $createVatTemplateService;
    // var $deliveryNoteTransactionService

    constructor(options) {
        this._options = options;
        this._docData;
        this._docObj;
        this._printData;
        this._isUS;
        this._doc;
        this._local;

        this._configure(options);


        this.$translate = new TlogDocsTranslateService({
            local: options.local
        });

        if (options && options.local) {
            this._local = options.local

        }
        else {
            this._local = 'he-IL';
        }
        this.$billService = new BillService(this._options);
        this.$createVatTemplateService = new CreateVatTemplateService(this._options)
        this.$createCreditSlipService = new CreateCreditSlipService();
        this.$deliveryNoteTransactionService = new DeliveryNoteTransactionDataService(this._options);
        this.$addTaxData = new AddTaxDataService();

        // $utils = new TlogDocsUtils();

        var cssStyling = `
        .templateDiv{
            background-color:white;
        }
        `
        var doc = document.implementation.createHTMLDocument("BillTemplate");

        this._doc = doc;

        var styleTag = this._doc.createElement('style');
        styleTag.id = 'styleTag'
        this._doc.head.appendChild(styleTag);
        var styleContent = this._doc.createTextNode(cssStyling)

        styleTag.appendChild(styleContent);
    }

    _configure(options) {
        debugger;
        if (options.local) this._options.local = options.local;
        if (options.isUS !== undefined) {
            this._options.isUS = options.isUS;
            this._isUS = options.isUS;
            if (options.local === 'en-US') {
                this._options.isUS = true;
            }
        };

        if (options.moment) {
            moment = options.moment;
        }
        else {
            moment = window.moment;
        }

    }

    //create document for export 
    createHTMLFromPrintDATA(docObj, printDataObj) {

        // Setting UP
        let isRefund = docObj.isRefund;

        // setting global variables
        this._docObj = docObj;
        this._dicData = printDataObj;

        //bill servuce for converting prnt data to collections, variables and data
        this._printData = this.$billService.resolvePrintData(printDataObj.printData, this._isUS)
        this._printData.isRefund = isRefund;


        //create basic document template the function create doc template returns a docTemplate with all its children
        var docTemplate = this.createDocTemplate(docObj);
        this._doc.body.appendChild(docTemplate);

        //******************  setting styling Try - delete when finished  ******************//
        // var htmlString = docTemplate.outerHTML;
        // _doc.getElementById('templateDiv').style.fontFamily = "Courier New, Courier, monospace";
        //******************************************************//

        // sending the doc
        var docToAdd = this._doc;
        var htmlString = new XMLSerializer().serializeToString(docToAdd);
        return htmlString

    }

    createDocTemplate(docObjChosen) {
        //create a template for the document and give it id 
        var docTemplate = this._doc.createElement('div');
        docTemplate.id = 'docTemplate';
        docTemplate.classList.add('basicTemplate');

        //set language and locals
        if (this._local == 'he-IL') {
            docTemplate.classList += ' rtl'
            docTemplate.classList.remove('ltr')
        }
        else {
            docTemplate.classList += ' ltr'
            docTemplate.classList.remove('rtl')
        }

        //create document header
        var templateHeader = this.createHeader(this._printData);
        docTemplate.appendChild(templateHeader);

        var checkInIL;
        if (this._local == 'he-IL' && docObjChosen.documentType === 'check') {
            checkInIL = true;
        }

        var isCreditSlip = (docObjChosen.md && docObjChosen.type === 'creditCard' && !docObjChosen.isFullOrderBill && !docObjChosen.md.checkNumber && !checkInIL)

        if (isCreditSlip !== null && isCreditSlip) {
            var tplCreditSlipTemplate = this.$createCreditSlipService.createCreditSlip(this._printData, docObjChosen, this._doc);
            docTemplate.appendChild(tplCreditSlipTemplate);
        }
        else {

            //create a general template content
            if (this._printData.variables.ORDER_TYPE.toUpperCase() !== "REFUND") {//in case the invoice is refund=> do not show the the tplOrderPaymentData div
                var tplOrderPaymentData = this.createOrderPaymentData(this._printData);
                tplOrderPaymentData.id = 'tplOrderPaymentData';
                tplOrderPaymentData.hasChildNodes() ? tplOrderPaymentData.classList += ' body-div' : '';

            };

            // var tplOrderPaymentData = createOrderPaymentData(_printData);
            var tplOrderTotals = this.createTotalsData(this._printData);
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

        }
        return docTemplate;
    }

    //header creator
    createHeader(printData) {

        //creating a div to populate and return
        var headerDiv = this._doc.createElement('div');
        headerDiv.id = "headerDiv";


        //setting header constants div for display
        var tplHeaderConstants = this._doc.createElement('div');
        tplHeaderConstants.id = "tplHeaderConstants"
        tplHeaderConstants.classList += ' rowPadding';
        // setting constants
        let headerKeys = [
            'ORGANIZATION_NAME',
            'ORGANIZATION_LEGAL_NAME',
            'ORGANIZATION_ADDR_STREET',
            'ORGANIZATION_ADDR_CITY',
            'ORGANIZATION_TEL'
        ];

        headerKeys.forEach(element => {
            var constantLine = this.placeHeaderData(printData, element)
            tplHeaderConstants.appendChild(constantLine)
        })

        //inner function for placing the constants on the template with data


        var tplHeader = this._doc.createElement('div');
        tplHeader.id = 'tplHeader';
        tplHeader.setAttribute('style', "text-align:center;")
        tplHeader.classList += ' rowPadding'
        var orderHeader = this.createOrderHeader(printData);
        orderHeader.id = 'orderHeader';
        orderHeader.classList += ' rowPadding'

        var tplOrderInfoText = this.createOrderInfoText(printData);
        tplOrderInfoText.id = 'tplOrderInfoText';

        tplHeader.appendChild(tplHeaderConstants);
        tplHeader.appendChild(orderHeader);
        tplHeader.appendChild(tplOrderInfoText);


        headerDiv.appendChild(tplHeader);
        //styling the header
        headerDiv.classList.add('header-div');
        headerDiv.classList.add('header-border');

        return headerDiv;
    }

    placeHeaderData(printData, element) {
        var tplHeaderLine = this._doc.createElement('div');
        tplHeaderLine.id = 'tplHeaderLine';
        if (printData.variables.hasOwnProperty(element)) {

            switch (element) {
                case 'ORGANIZATION_NAME': {
                    tplHeaderLine.innerHTML = printData.variables.ORGANIZATION_NAME;
                    tplHeaderLine.classList += ' big-chars';
                }
                    break;
                case 'ORGANIZATION_LEGAL_NAME': {
                    if (!this._isUS) {
                        var bnNumber = this.$translate.getText('BN_NUMBER');
                        var orgString = printData.variables.ORGANIZATION_LEGAL_NAME + "-" + bnNumber + " " + printData.variables.ORGANIZATION_BN_NUMBER;
                        tplHeaderLine.innerHTML = orgString;
                    }
                    else {
                        tplHeaderLine.innerHTML = printData.variables.ORGANIZATION_LEGAL_NAME
                    }
                }
                    break;
                case 'ORGANIZATION_ADDR_STREET': {
                    tplHeaderLine.innerHTML = printData.variables.ORGANIZATION_ADDR_STREET;
                }
                    break;
                case 'ORGANIZATION_ADDR_CITY': {
                    tplHeaderLine.innerHTML = printData.variables.ORGANIZATION_ADDR_CITY;
                }
                    break;
                case 'ORGANIZATION_TEL': {
                    var phoneTranslate = this.$translate.getText('PHONE');
                    var phoneString = phoneTranslate + " " + printData.variables.ORGANIZATION_TEL;
                    tplHeaderLine.innerHTML = phoneString;
                }
                    break;

            }
        }
        return tplHeaderLine;

    }

    createOrderHeader(printData) {
        //Bring the tplOrderHeader for appending other divs to it
        var tplOrderHeader = this._doc.createElement('div');
        tplOrderHeader.id = 'tplOrderHeader';
        //all order header needed Divs
        var tplOrderCustomer = this._doc.createElement('div');
        tplOrderCustomer.id = "tplOrderCustomer";
        var tplOrderDateTime = this._doc.createElement('div');
        tplOrderDateTime.id = "tplOrderDateTime";
        tplOrderDateTime.classList.add('mystyle');
        // var tplOrderTitle = _doc.createElement('div');
        // tplOrderTitle.id = "tplOrderTitle";
        var tplOrderType = this._doc.createElement('div');
        tplOrderType.id = "tplOrderType";
        tplOrderType.setAttribute('style', 'text-align:center;')
        var tplOrderTable = this._doc.createElement('div');
        tplOrderTable.id = "tplOrderTable";
        var tplOrderServerClients = this._doc.createElement('div');
        tplOrderServerClients.id = "tplOrderServerClients";
        //create array for the appendChildren function
        var orderBasicInfoArray = [tplOrderCustomer, tplOrderDateTime, tplOrderType, tplOrderTable, tplOrderServerClients,];

        var filledInfoArray = [];
        this.placeOrderHeaderData(printData, orderBasicInfoArray, filledInfoArray)


        var tplOrderHeaderReturn = this.appendChildren(tplOrderHeader, filledInfoArray)

        return tplOrderHeaderReturn;

    }
    placeOrderHeaderData(printData, array, filledInfoArray) {
        array.forEach(element => {
            var singleElement = this.fillOrderHeaderData(printData, element)
            filledInfoArray.push(singleElement);

        });
    }


    fillOrderHeaderData(printData, htmlElement) {

        switch (htmlElement.id) {
            case 'tplOrderCustomer': {
                if (printData.variables.CUSTOMER_ID) {
                    var forText = this.$translate.getText("FOR");
                    var BnOrSnText = this.$translate.getText("BN_OR_SN");
                    var customerName = printData.collections.PAYMENT_LIST[0].CUSTOMER_NAME;
                    var customerId = printData.collections.PAYMENT_LIST[0].CUSTOMER_ID;
                    htmlElement.innerText = forText + ": " + customerName + " " + BnOrSnText + ": " + customerId;
                }
            }
                break;

            case 'tplOrderDateTime': {
                if (printData.variables.CREATED_AT) {
                    var dateStr = printData.variables.CREATED_AT;
                    if (this._isUS) htmlElement.innerHTML = this.formatDateUS(dateStr);

                    else if (!this._isUS) {
                        htmlElement.innerHTML = this.formatDateIL(dateStr);
                    }
                    htmlElement.setAttribute('class', 'med-chars');

                }
            }
                break;
            //Asked to take this down temporary
            // case 'tplOrderTitle': {
            //     if (_docObj.title) {
            //         htmlElement.innerHTML = _docObj.title;
            //         htmlElement.setAttribute('class', 'med-chars');
            //     }
            // }
            //     break;
            case 'tplOrderType': {
                if (printData.variables.ORDER_TYPE && printData.variables.ORDER_TYPE.toUpperCase() !== "REFUND") {
                    var typeTranslate = this.$translate.getText("ORDER_TYPE")
                    var orderType = "ORDER_TYPES_" + printData.variables.ORDER_TYPE;
                    var typeDataTranslate = this.$translate.getText(orderType);
                    htmlElement.innerHTML = "<div class='centralize' style='justify-content:center;'><span>" + typeTranslate + "</span>" + "&nbsp;" + "<span>" + typeDataTranslate + "</span > " + "&nbsp;" + " <span> #" + printData.variables.ORDER_NO + "</span ></div > "
                    htmlElement.setAttribute('class', 'med-chars');

                }
            }
                break;
            case 'tplOrderTable': {
                if (printData.variables.ORDER_TYPE === "SEATED" && printData.variables.TABLE_NO) {
                    var tableTranslate = this.$translate.getText("table")
                    htmlElement.innerHTML = tableTranslate + " " + printData.variables.TABLE_NO;
                    htmlElement.setAttribute('class', 'med-chars');

                }
            }
                break;
            case 'tplOrderServerClients': {
                if (!(this._dicData.documentType === "invoice") && !(this._dicData.documentType === "deliveryNote")) {
                    var waiterTranslate = this.$translate.getText("Server")
                    var dinersTranslate = this.$translate.getText("Diners")
                    var firstName = printData.variables.F_NAME && printData.variables.F_NAME !== null ? printData.variables.F_NAME : '';
                    var lastName = printData.variables.L_NAME && printData.variables.L_NAME !== null ? printData.variables.L_NAME : '';
                    htmlElement.innerHTML = `<span> ` + waiterTranslate + ": " + firstName + " " + lastName.substring(0, 1) + " - " + dinersTranslate + ": " + printData.variables.NUMBER_OF_GUESTS + `</span>`;
                }
            }
                break;

        }
        return htmlElement;

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
        if (printData.data.isReturnOrder) {
            var isReturnOrderTextDiv = this._doc.createElement('div');
            isReturnOrderTextDiv.id = "isReturnOrderTextDiv";
            isReturnOrderTextDiv.innerHTML = this.$translate.getText('RETURN_TRANSACTION');
            tplOrderInfoText.appendChild(isReturnOrderTextDiv);
            //return order comment
            if (printData.variables.RETURN_COMMENT) {
                var returnOrderCommentDiv = this._doc.createElement('div');
                returnOrderCommentDiv.id = "returnOrderCommentDiv";
                returnOrderCommentDiv.innerHTML = printData.variables.RETURN_COMMENT;
                tplOrderInfoText.appendChild(returnOrderCommentDiv);
            }
        }
        //check if this is order is tax exempted  and prints if it is
        if (printData.data.isTaxExempt) {
            if (printData.variables.TAX_EXEMPTION_CODE) {
                var isTaxExemptCodeDiv = this._doc.createElement('div');
                isTaxExemptCodeDiv.id = "isTaxExemptCodeDiv";
                isTaxExemptCodeDiv.innerHTML = printData.variables.TAX_EXEMPTION_CODE;
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

    createOrderPaymentData(printData) {

        var tplOrderPaymentData = this._doc.createElement('div');
        let data = this.$billService.resolveItems(printData.variables, printData.collections);
        tplOrderPaymentData.classList += ' tpl-body-div';
        var paymentDataDiv = this._doc.createElement('div');
        paymentDataDiv.id = "paymentDataDiv";
        paymentDataDiv.classList += ' padding-top';
        paymentDataDiv.classList += ' padding-bottom';


        tplOrderPaymentData.appendChild(paymentDataDiv);

        if (this._docObj && !(this._dicData.documentType === "deliveryNote")) {
            this.fillItemsData(paymentDataDiv, data, printData);
            this.fillOthData(paymentDataDiv, data);
        }
        else if (this._docObj && this._dicData.documentType === "deliveryNote") {
            this.fillItemsData(paymentDataDiv, data, printData);
            this.fillOthData(paymentDataDiv, data);
            var delNoteTransDiv = this.$deliveryNoteTransactionService.createDeliveryNoteTransactionData(printData, this._doc);
            tplOrderPaymentData.appendChild(delNoteTransDiv);
        }
        return tplOrderPaymentData
    }

    fillItemsData(htmlElement, data, printData) {

        if (!printData.isRefund) {
            data.items.forEach(item => {

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

                htmlElement.appendChild(itemDiv);

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
            var cashBackText = this.$translate.getText(printData.variables.CHANGE ? 'TOTAL_CASHBACK' : "");

            var lastFourDiv = this._doc.createElement('div');
            if (lastFourText) {
                lastFourDiv.innerHTML = "<div class='itemDiv'>" +
                    "<div class='total-name'>" + (lastFourText ? lastFourText : " ")
                    + " " + (creditData.LAST_4 ? creditData.LAST_4 : " ") + "</div>"
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
                "<div class='total-name'>" + (transactTimeText ? transactTimeText : "") + " " + (transactTimeText ? dateTimeResult : "") + "</div>" +
                "</div>"

            creditDataDiv.appendChild(transactionTimeDiv);

            var transactNumDiv = this._doc.createElement('div');
            if (creditData.PROVIDER_TRANS_ID) {
                transactNumDiv.innerHTML = "<div class='itemDiv'>" +
                    "<div class='total-name'>" + (transactNumText ? transactNumText : " ") +
                    " " + (creditData.PROVIDER_TRANS_ID ? creditData.PROVIDER_TRANS_ID : " ") + "</div>" + "</div>"
            }
            creditDataDiv.appendChild(transactNumDiv);

            var approvalDiv = this._doc.createElement('div');
            if (creditData.CONFIRMATION_NUMBER) {
                approvalDiv.innerHTML = "<div class='itemDiv'>" +
                    "<div class='total-name'>" + (approvalText ? approvalText : " ") + " " + (creditData.CONFIRMATION_NUMBER ? creditData.CONFIRMATION_NUMBER : " ") + "</div>" + "</div>"

                creditDataDiv.appendChild(approvalDiv);

            }

            var cashBackDiv = this._doc.createElement('div');
            if (printData.collections.PAYMENT_LIST[0].P_CHANGE) {
                cashBackDiv.innerHTML = "<div class='changeDiv'>" +
                    "<div class='total-name'>" + (cashBackText ? cashBackText : " ") + "</div>" +
                    "<div class='total-amount'>" + (printData.collections.PAYMENT_LIST[0].P_CHANGE ? Number(printData.collections.PAYMENT_LIST[0].P_CHANGE).toFixed(2) : " ") + "</div>"
                    + "</div >"
                creditDataDiv.appendChild(cashBackDiv);
            }
        }

        return creditDataDiv

    }

    createTotalsData(printData) {
        var tplOrderTotals = this._doc.createElement('div');
        tplOrderTotals.id = 'tplOrderTotals';
        tplOrderTotals.hasChildNodes() ? tplOrderTotals.classList += ' tpl-body-div' : '';
        // let data = _billService.resolveItems(printData.variables, printData.collections);

        var taxDataDiv = this.$addTaxData.addTaxDataFunc(printData);
        if (taxDataDiv !== null) { tplOrderTotals.appendChild(taxDataDiv); }

        if (this._docObj && (this._dicData.documentType ===
            ('invoice' || 'CreditCardPayment' || 'CreditCardRefund' || 'CashPayment' || 'GiftCard' || 'CashRefund' || 'ChequePayment' || 'ChequeRefund'))) {
            var vatTemplateDiv = this.$createVatTemplateService.createVatTemplate(printData, this._doc);
            tplOrderTotals.appendChild(vatTemplateDiv);
        }
        else if (this._docObj && (this._dicData.documentType === 'deliveryNote')) {
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
                var totalDiv = this._doc.createElement('div');
                if (total.type === 'exclusive_tax') {
                    totalDiv.innerHTML = "<div class='itemDiv'>" +
                        "<div class='total-name'>" + "&nbsp;&nbsp;" + (total.name ? total.name : " ") + " " + (total.rate ? total.rate + " &nbsp;%" : " ") + "</div>" + " " +
                        "<div class='total-amount " + this.isNegative(total.amount) + "'>" + (total.amount ? total.amount : " ") +
                        "</div>" +
                        "</div>"
                }
                else if (total.type !== 'exclusive_tax') {
                    totalDiv.innerHTML = "<div class='itemDiv'>" +
                        "<div class='total-name'>" + (total.name ? total.name : " ") + "</div>" + " " +
                        "<div class='total-amount " + this.isNegative(total.amount) + "'>" + (total.amount ? total.amount : " ") + "</div>" +
                        "</div>"
                }

                htmlElement.appendChild(totalDiv);
            })
        }
    }

    createPaymentsData(printData) {

        var tplOrderPaymentsDiv = this._doc.createElement('div');
        tplOrderPaymentsDiv.id = 'tplOrderPayments';


        // let data = _billService.resolveItems(printData.variables, printData.collections);

        if (this._docObj && this._dicData.documentType === "deliveryNote") {
            return tplOrderPaymentsDiv;
        }

        else if (this._docObj && this._dicData.documentType === "invoice") {
            if (this._docObj.docPaymentType === "CreditCardPayment" || this._docObj.docPaymentType === "CreditCardRefund") {
                var creditPaymentDiv = this.createCreditTemplate(printData);
                tplOrderPaymentsDiv.appendChild(creditPaymentDiv);
            }
            else if (this._docObj.docPaymentType === ("GiftCard")) {
                var giftCardPayment = this.createGiftCardDetails(printData);
                tplOrderPaymentsDiv.appendChild(giftCardPayment);
            }
            else if (this._docObj.docPaymentType === "CashPayment" || this._docObj.docPaymentType === "CashRefund") {
                var cashPayment = this.createCashPaymentFooter(printData);
                tplOrderPaymentsDiv.appendChild(cashPayment);
            }
            else if (this._docObj.docPaymentType === "ChequePayment" || this.docObj.docPaymentType === "ChequeRefund") {
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
                    holderNameDiv.innerHTML = "&nbsp;&nbsp;&nbsp;" + payment.holderName;
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
            "<div class='total-name'>" + (paidGiftCardText ? paidGiftCardText : " ") + "</div>" + "<div class='total-amount'>" + pAmount + "</div></div>"

        giftCardDiv.appendChild(giftCardPaidDiv);

        //giftcard Num div
        var giftCardNum = this.$translate.getText('CARD_NO');
        var cardNum = printData.collections.GIFT_CARD_PAYMENTS[0].CARD_NUMBER ? printData.collections.GIFT_CARD_PAYMENTS[0].CARD_NUMBER : '';
        var giftCardNumDiv = this._doc.createElement('div')
        giftCardNumDiv.innerHTML = "<div class='itemDiv'>" +
            "<div class='total-name'>" + (giftCardNum ? giftCardNum : " ") + " " + cardNum + "</div>" +
            "</div>"

        giftCardDiv.appendChild(giftCardNumDiv);

        //transaction Num div
        var transactionNumText = this.$translate.getText('TRANSACTION_NO');
        var transactNum = printData.collections.GIFT_CARD_PAYMENTS[0].PROVIDER_TRANS_ID ? printData.collections.GIFT_CARD_PAYMENTS[0].PROVIDER_TRANS_ID : '';
        var transactNumDiv = this._doc.createElement('div')
        transactNumDiv.innerHTML = "<div class='itemDiv'>" +
            "<div class='total-name'>" + (transactionNumText ? transactionNumText : " ") + " " + transactNum + "</div>" +
            "</div>"

        giftCardDiv.appendChild(transactNumDiv);

        return giftCardDiv;
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
            "<div class='total-amount " + this.isNegative(pAmount) + "'>" + (pAmount).toFixed(2) + "</div>" +
            "</div>"

        cashDiv.appendChild(cashPaidDiv);

        //Change div
        if (printData.collections.PAYMENT_LIST[0].P_CHANGE) {
            var changeText = this.$translate.getText('TOTAL_CASHBACK');
            var pChange = printData.collections.PAYMENT_LIST[0].P_CHANGE ? Number(printData.collections.PAYMENT_LIST[0].P_CHANGE).toFixed(2) : '';
            var transactNumDiv = this._doc.createElement('div')
            transactNumDiv.innerHTML = "<div class='changeDiv'>" +
                "<div class='total-name'>" + (changeText ? changeText : '') + "</div>" +
                "<div class='total-amount " + this.isNegative(pChange) + "'>" + pChange + "</div>" +
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
            "<div class='total-amount " + this.isNegative(pAmount) + "'>" + (pAmount).toFixed(2) + "</div>" +
            "</div>"

        chequeDiv.appendChild(chequePaidDiv);

        //Change div
        if (printData.collections.PAYMENT_LIST[0].P_CHANGE) {
            var changeText = this.$translate.getText('TOTAL_CASHBACK');
            var pChange = printData.collections.PAYMENT_LIST[0].P_CHANGE ? Number(printData.collections.PAYMENT_LIST[0].P_CHANGE).toFixed(2) : '';
            var transactNumDiv = this._doc.createElement('div')
            transactNumDiv.innerHTML = "<div class='changeDiv'>" +
                "<div class='total-name'>" + (changeText ? changeText : '') + "</div>" +
                "<div class='total-amount " + this.isNegative(pChange) + "'>" + pChange + "</div>" +
                "</div>"

            chequeDiv.appendChild(transactNumDiv);
        }

        return chequeDiv;
    }

    //create svg function
    makeSVG(tag, attrs) {
        var el = this._doc.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var k in attrs)
            el.setAttribute(k, attrs[k]);
        return el;
    }

    //function for appending multiple children
    appendChildren(target, array) {
        var divForAppending = this._doc.createElement('div');
        var length = array.length;
        if (length > 0) {
            array.forEach(element => {
                divForAppending.appendChild(element);
            })
        }
        return divForAppending;
    }

    isNegative(amount) {
        var intAmount = parseInt(amount);
        return intAmount < 0 ? 'negative' : "";

    }

    formatDateUS(stringDate) {
        var date = new Date(stringDate);
        return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear() + " " + date.getHours() + ":" +
            ((date.getMinutes() > 10) ? date.getMinutes() : "0" + date.getMinutes()) + " " + (date.getHours() > 12 ? "PM" : "AM");
    }

    formatDateIL(stringDate) {
        var date = new Date(stringDate);
        return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + " " +
            ((date.getHours() > 10) ? date.getHours() : "0" + date.getHours()) + ":" + ((date.getMinutes() > 10) ? date.getMinutes() : "0" + date.getMinutes());
    }

    // TemplateBuilderService.prototype.createHTMLFromPrintDATA = (docObj, printData) => createHTMLFromPrintDATA(docObj, printData);

    // return TemplateBuilderService;

}
// })();