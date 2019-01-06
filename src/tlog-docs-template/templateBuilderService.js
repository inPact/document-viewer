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
import Utils from '../helpers/utils.service';
import HtmlCreator from '../helpers/htmlCreator.service';
import Localization from '../helpers/localization.service';
import DocumentFactory from '../helpers/documentFactory.service';
import CreditTransaction from '../services/creditTransaction.service';
import ClubMembersService from '../services/clubMembers.service';
import _ from 'lodash';



export default class TemplateBuilderService {
    constructor(options) {
        this._isUS;
        this._locale;
        this._configure(options);
        this._isGiftCardBill;
        this._isTaxExempt;

        this.$utils = new Utils();
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
        this.$localization = new Localization({ isUS: this._isUS });
        this.$htmlCreator = new HtmlCreator();
        this.$creditTransaction = new CreditTransaction(options);
        this.$clubMembersService = new ClubMembersService(options);
    }

    _configure(options) {
        if (options.locale) this._locale = options.locale;
        if (options.isUS !== undefined) this._isUS = options.isUS;

    }

    createHTMLFromPrintDATA(documentInfo, printData, options = {}) {

        this._doc = DocumentFactory.get({
            createNew: true,
            documentInfo, documentInfo,
            printData: printData
        });

        this._docObj = documentInfo;
        this._docData = printData;
        this._printData = this.$billService.resolvePrintData(printData.printData, this._isUS);
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
        docTemplate.classList.add('text-uppercase');

        if (this._locale == 'he-IL') {
            docTemplate.classList += ' rtl'
            docTemplate.classList.remove('ltr')
        }
        else {
            docTemplate.classList += ' ltr'
            docTemplate.classList.remove('rtl')
        }

        // Set pkg version (hidden element).
        let elementVersion = this.$htmlCreator.create({
            type: 'div',
            id: 'version',
            classList: ['hidden-element'],
            value: VERSION
        });

        console.log('doc-viewer version : ' + VERSION);

        docTemplate.appendChild(elementVersion);


        if (!this._excludeHeader) {
            var templateHeader = this.$headerService.createHeader(this._printData, this._doc, this._docObj, this._docData);
            templateHeader.classList += ' text-center';

            docTemplate.appendChild(templateHeader);
        }


        var checkInIL;
        if (this._locale == 'he-IL' && docObjChosen.documentType === 'check') {
            checkInIL = true;
        }

        if (docObjChosen.type === 'clubMembers') {


            let elementClubMember = this.$clubMembersService.get({
                totalAmount: this._printData.variables.TOTAL_AMOUNT,
                members: this._printData.collections.MEMBERS
            });

            docTemplate.appendChild(elementClubMember);
        } else {

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
                    let child = tplOrderPaymentData.children[0];

                    if (!child.hasChildNodes()) {
                        tplOrderPaymentData.classList.remove('tpl-body-div');
                    } else {
                        tplOrderPaymentData.classList += ' body-div';
                    }

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

                if (this._printData.data.taxes.InclusiveTaxes && this._printData.data.taxes.InclusiveTaxes.length > 0) {
                    if (this._isUS) {
                        var inclusiveTaxesDiv = this.$addTaxData.createInclusiveTaxFunc(this._printData, this._doc);
                        if (inclusiveTaxesDiv !== null) docTemplate.appendChild(inclusiveTaxesDiv)
                    }
                }


                if (this._printData.variables.CUSTOMER_MESSAGE && docObjChosen.isFullOrderBill) {
                    var customerMessageDiv = this.createCustomerMessage(this._printData, this._doc);
                    if (customerMessageDiv !== null) docTemplate.appendChild(customerMessageDiv)
                }
            }


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
                let emvCreditDataDiv = this._doc.createElement('div');
                emvCreditDataDiv.id = 'emvCreditDataDiv';
                emvCreditDataDiv.appendChild(this.$emvService.createEmvTemplate(this._docData.documentType, this._printData, this._doc));
            }
            if (this._printData.data.isReturnOrder && this._docObj.isFullOrderBill) {
                docTemplate.appendChild(this.createReturnOrderText(this._printData));
            }
        }

        // let elementVersion = this.$htmlCreator.create({
        //     type: 'div',
        //     id: 'version',
        //     classList: ['hidden-element'],
        //     value: VERSION
        // });

        //docTemplate.appendChild(elementVersion);

        return docTemplate;
    }

    createOrderPaymentData(printData) {

        var tplOrderPaymentData = this._doc.createElement('div');
        let data = this.$billService.resolveItems(printData.variables, printData.collections);

        tplOrderPaymentData.classList += ' tpl-body-div';
        var paymentDataDiv = this._doc.createElement('div');
        paymentDataDiv.id = "paymentDataDiv";
        paymentDataDiv.classList += ' padding-top';
        paymentDataDiv.classList += ' border-bottom';
        paymentDataDiv.classList += ' tpl-body-div';

        tplOrderPaymentData.appendChild(paymentDataDiv);

        if (this._docObj && !(this._docData.documentType === "deliveryNote")) {
            this.fillItemsData(paymentDataDiv, data, printData);
            this.fillOthData(paymentDataDiv, data);
        }
        else if (this._docObj && (this._docData.documentType === "deliveryNote" || this._docData.documentType === "refundDeliveryNote")) {


            console.log("this._docData.documentType");
            console.log(this._docData.documentType);
            console.log("this._docData.documentType");


            this.fillItemsData(paymentDataDiv, data, printData);
            this.fillOthData(paymentDataDiv, data);
            var delNoteTransDiv = this.$deliveryNoteTransactionService.createDeliveryNoteTransactionData();
            tplOrderPaymentData.appendChild(delNoteTransDiv);
            paymentDataDiv.classList += ' border-bottom';
        }

        return tplOrderPaymentData;
    }

    fillItemsData(htmlElement, data, printData) {

        if (!printData.isRefund) {

            data.items.forEach((item, index) => {

                //in case it is return order, we don't want to show return of item the did not cost anything
                if (!(data.isReturnOrder && this._docObj.isFullOrderBill && (!item.amount || item.amount === '0.00'))) {

                    let elementItemQty = this.$htmlCreator.create({
                        type: 'div',
                        id: `item-qty-${index}`,
                        classList: ['item-qty'],
                        value: item.qty
                    });

                    let elementItemName = this.$htmlCreator.create({
                        type: 'div',
                        id: `item-name-${index}`,
                        classList: ['item-name'],
                        value: item.isOffer ? `${item.name || ''}` : `&nbsp;&nbsp;${item.name || ''}`
                    });

                    let classList = ['total-amount'];
                    let negativeClass = this.$utils.isNegative(item.amount);
                    if (negativeClass !== "") {
                        classList.push(negativeClass);
                    }

                    let elementItemAmount = this.$htmlCreator.create({
                        type: 'div',
                        id: `item-amount-${index}`,
                        classList: classList,
                        value: this.$utils.twoDecimals(item.amount)
                    });

                    let elementItemContainer = this.$htmlCreator.create({
                        type: 'div',
                        id: `item-${index}`,
                        classList: item.isOffer ? ['itemDiv', 'bold'] : ['itemDiv'],
                        children: [
                            elementItemQty,
                            elementItemName,
                            elementItemAmount
                        ]
                    });

                    htmlElement.appendChild(elementItemContainer);

                    if (item.isWeight) {

                        var isGram = item.isWeight && printData.variables.BASIC_WEIGHT_UOM === 'kg' && item.units < 1;

                        var calcWeight = isGram ? item.units * 1000 : item.units;
                        var weightCalculatedUnit = isGram ? this.$translate.getText('gram') : this.$translate.getText('kg');
                        var weightPerUnitTranslate = this._isUS ? this.$translate.getText('dlrPerlb') : this.$translate.getText('ilsToKg')
                        var weightTranslate = this._isUS ? this.$translate.getText('lb') : weightCalculatedUnit;

                        var weightText = '';
                        if (this._isUS) {
                            weightText = `${calcWeight}[${weightTranslate}] @ ${this.$localization.getSymbol()}${item.weightAmount}/${weightTranslate}`;
                        }
                        else {
                            weightText = `${calcWeight} ${weightTranslate} @ ${item.weightAmount} ${weightPerUnitTranslate}`;
                        }

                        let elementWeightItemQty = this.$htmlCreator.create({
                            type: 'div',
                            id: `weight-item-qty-${index}`,
                            classList: ['item-qty'],
                            value: ""
                        });

                        let elementWeightItemValue = this.$htmlCreator.create({
                            type: 'div',
                            id: `weight-item-value-${index}`,
                            classList: ['item-name'],
                            value: weightText
                        });

                        let elementWeightItemAmount = this.$htmlCreator.create({
                            type: 'div',
                            id: `weight-item-amount-${index}`,
                            classList: ['total-amount'],
                            value: ""
                        });

                        let elementWeightItemContainer = this.$htmlCreator.create({
                            type: 'div',
                            id: `weight-item-${index}`,
                            classList: ['itemDiv', 'fs-12'],
                            children: [
                                elementWeightItemQty,
                                elementWeightItemValue,
                                elementWeightItemAmount
                            ]
                        });


                        htmlElement.appendChild(elementWeightItemContainer);
                    }

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
                "<div class='total-amount " + this.$utils.isNegative(othItem.amount) + "'>" + (othItem.amount ? othItem.amount : "") + "</div>" +
                "</div>"

            htmlElement.appendChild(othItemDiv);

        })
    }

    createCreditTemplate(printData) {
        var CreditTemplate = this._doc.createElement('div');
        CreditTemplate.id = "CreditTemplate";
        var CreditHeaderDiv = this._doc.createElement('div');
        CreditHeaderDiv.id = "CreditHeaderDiv";
        CreditHeaderDiv.classList += ' border-bottom';
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
                    "<div class='total-amount " + this.$utils.isNegative(paymentAmount) + "'>" + (paymentAmount ? Number(paymentAmount).toFixed(2) : "") + "</div>" +
                    "</div>"
                CreditTemplate.appendChild(CreditHeaderDiv);

            }
            else {
                var paidCredFromTranslate = this.$translate.getText('PAID_IN_CREDIT_FROM')
                CreditHeaderDiv.classList.add("bold");
                paidCredFromText = paidCredFromTranslate;
                CreditHeaderDiv.innerHTML = "<div class='itemDiv'>" +
                    "<div class='total-name'>" + (!(paidCredFromText === null) ? paidCredFromText : "") + " " + (issuer ? issuer : "") + "</div>" + " " +
                    "<div class='total-amount " + this.$utils.isNegative(paymentAmount) + "'>" + (paymentAmount ? Number(paymentAmount).toFixed(2) : "") + "</div>" +
                    "</div>"
                CreditTemplate.appendChild(CreditHeaderDiv);

            }


            var cashBackText = this.$translate.getText(printData.variables.CHANGE ? 'TOTAL_CASHBACK' : "");
            var cashBackDiv = this._doc.createElement('div');
            var pChange = printData.collections.PAYMENT_LIST[0].P_CHANGE;

            if (pChange && pChange !== 0) {
                cashBackDiv.innerHTML = "<div class='changeDiv padding-bottom'>" +
                    "<div class='total-name'>" + (cashBackText ? cashBackText : " ") + "</div>" +
                    "<div class='total-amount'>" + ((pChange && pChange !== 0) ? this.$utils.twoDecimals(pChange) : " ") + "</div>"
                    + "</div >"

                CreditHeaderDiv.appendChild(cashBackDiv);
            }
            else {
                cashBackDiv.innerHTML = "<div class='changeDiv padding-bottom '></div>"
            }

            var creditDataTemplate = this.createCreditDataTemplate(credPayments, printData)
            CreditTemplate.appendChild(creditDataTemplate)

        }
        return CreditTemplate;
    }

    createCreditDataTemplate(creditData, printData) {
        var creditDataDiv = this._doc.createElement('div');
        creditDataDiv.id = "creditDataDiv";


        if (
            this._docData.documentType === 'invoice' &&
            this._printData.collections.CREDIT_PAYMENTS &&
            this._printData.collections.CREDIT_PAYMENTS.length > 0 &&
            this._printData.collections.CREDIT_PAYMENTS[0].EMV &&
            this._printData.collections.CREDIT_PAYMENTS[0].EMV.length > 0) {
            let emvCreditDataDiv = this._doc.createElement('div');
            emvCreditDataDiv.id = 'emvCreditDataDiv';
            emvCreditDataDiv.appendChild(this.$emvService.createEmvTemplate(this._docData.documentType, this._printData, this._doc));
            creditDataDiv.appendChild(emvCreditDataDiv);
        }
        else if (creditData) {

            let elementCreditTransaction = this.$creditTransaction.get({
                isUS: this._isUS,
                data: creditData
            });

            creditDataDiv.appendChild(elementCreditTransaction);

            // var lastFourText = this.$translate.getText(creditData.LAST_4 ? 'LAST_4' : "");
            // var transactTimeText = this.$translate.getText(creditData.PROVIDER_PAYMENT_DATE ? 'TRANSACTION_TIME' : "");
            // var transactNumText = this.$translate.getText(creditData.PROVIDER_TRANS_ID ? 'TRANSACTION_NO' : "");
            // var approvalText = this.$translate.getText(creditData.CONFIRMATION_NUMBER ? 'APPROVAL_NO' : "");


            // var lastFourDiv = this._doc.createElement('div');
            // if (lastFourText) {
            //     lastFourDiv.innerHTML = "<div class='itemDiv'>" +
            //         "<div class='total-name'>" + (lastFourText ? lastFourText : " ") + "</div>"
            //         + " " + "<div class='number-data'>" + (creditData.LAST_4 ? creditData.LAST_4 : " ") + "</div>" + "</div>"

            // }
            // creditDataDiv.appendChild(lastFourDiv);

            // let providerPaymentDate = this.$utils.toDate({
            //     _isUS: this._isUS,
            //     date: creditData.PROVIDER_PAYMENT_DATE
            // });

            // var transactionTimeDiv = this._doc.createElement('div')

            // transactionTimeDiv.innerHTML = "<div class='itemDiv'>" +
            //     "<div class='total-name'>" + (transactTimeText ? transactTimeText : "") + "</div>" + "<div class='number-data'>" + (transactTimeText ? providerPaymentDate : "") + "</div>" +
            //     "</div>"

            // creditDataDiv.appendChild(transactionTimeDiv);

            // var transactNumDiv = this._doc.createElement('div');
            // if (creditData.PROVIDER_TRANS_ID) {
            //     transactNumDiv.innerHTML = "<div class='itemDiv'>" +
            //         "<div class='total-name'>" + (transactNumText ? transactNumText : " ") + "</div>" +
            //         "<div class='number-data'>" + (creditData.PROVIDER_TRANS_ID ? creditData.PROVIDER_TRANS_ID : " ") + "</div>" + "</div>"
            // }
            // creditDataDiv.appendChild(transactNumDiv);

            // var approvalDiv = this._doc.createElement('div');
            // if (creditData.CONFIRMATION_NUMBER) {
            //     approvalDiv.innerHTML = "<div class='itemDiv'>" +
            //         "<div class='total-name'>" + (approvalText ? approvalText : " ") + "</div>" +
            //         "<div class='number-data'>" + (creditData.CONFIRMATION_NUMBER ? creditData.CONFIRMATION_NUMBER : " ") + "</div>" + "</div>"
            // }
            // creditDataDiv.appendChild(approvalDiv);

        }

        return creditDataDiv
    }

    createTotalsData(printData, isGiftCardBill, isTaxExempt) {
        var tplOrderTotals = this._doc.createElement('div');
        tplOrderTotals.id = 'tplOrderTotals';
        tplOrderTotals.hasChildNodes() ? tplOrderTotals.classList += ' tpl-body-div' : '';

        // if (!isTaxExempt) {
        //     var taxDataDiv = this.$addTaxData.addTaxDataFunc(printData, this._doc, this._isGiftCardBill);
        //     if (taxDataDiv !== null) {
        //         tplOrderTotals.appendChild(taxDataDiv);
        //     }
        // }

        // if (taxDataDiv && !isGiftCardBill && !isTaxExempt) { tplOrderTotals.appendChild(taxDataDiv); }

        console.log('refundDeliveryNote 123123123123');

        if (this._docObj && [
            'invoice',
            'CreditCardPayment',
            'CreditCardRefund',
            'CashPayment',
            'GiftCard',
            'CashRefund',
            'ChequePayment',
            'ChequeRefund',
            'refundInvoice',
            'refundDeliveryNote'
        ].indexOf(this._docData.documentType) > -1) {


            console.log("this._docData.documentType");
            console.log(this._docData.documentType);

            var vatTemplateDiv = this.$vatTemplateService.createVatTemplate(printData, this._doc);
            tplOrderTotals.appendChild(vatTemplateDiv);
        }
        else if (this._docObj && (this._docData.documentType === 'deliveryNote')) {
            return tplOrderTotals;
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
                    totalDiv.innerHTML = "<div class='itemDiv small-chars'>" +
                        "<div class='total-name'>" + "&nbsp;&nbsp;" + (total.name ? total.name : " ") + " " + (total.rate ? this.$utils.twoDecimals(total.rate) + "%" : " ") + "</div>" + " " +
                        "<div class='total-amount " + this.$utils.isNegative(total.amount) + "'>" + (total.amount ? this.$utils.twoDecimals(total.amount) : " ") + "</div>" + "</div>"
                }
                else if (total.type !== 'exclusive_tax') {
                    totalDiv.innerHTML = "<div class='itemDiv " + (isCheckTotal ? " bold" : '') + "'>" +
                        "<div class='total-name'>" + (total.name ? total.name : " ") + "</div>" + " " +
                        "<div class='total-amount " + this.$utils.isNegative(total.amount) + "'>" + (total.amount ? this.$utils.twoDecimals(total.amount) : " ") + "</div>" +
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

        else if (this._docObj && ["invoice", "refundInvoice"].indexOf(this._docData.documentType) > -1) {

            if (this._docObj.docPaymentType === "CreditCardPayment" || this._docObj.docPaymentType === "CreditCardRefund") {
                var creditPaymentDiv = this.createCreditTemplate(printData);
                tplOrderPaymentsDiv.appendChild(creditPaymentDiv);

                if (_.get(this, '_docObj.md.signature') && !this._isUS && this._docObj.docPaymentType === "CreditCardPayment") {
                    var signatureArea = this._doc.createElement('div');
                    signatureArea.id = 'signatureArea';
                    signatureArea.className += ' item-div';

                    tplOrderPaymentsDiv.appendChild(signatureArea);
                    tplOrderPaymentsDiv.appendChild(this.$signatureService.getSignature(signatureArea));
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
        return tplOrderPaymentsDiv;
    }

    fillPaymentsData(printData) {
        var OrderPaymentsDiv = this._doc.createElement('div');
        OrderPaymentsDiv.id = 'OrderPaymentsDiv';

        if (printData.data.payments.length > 0) {
            printData.data.payments.forEach(payment => {
                var paymentDiv = this._doc.createElement('div');
                var pAmount;
                var changeAmountZero;
                if (payment) {
                    pAmount = payment.amount;
                    changeAmountZero = (pAmount === 0 && payment.type === 'change');
                    if (!changeAmountZero) {
                        paymentDiv.innerHTML =
                            "<div class=" + (payment.type === 'change' ? 'changeDiv' : 'itemDiv') + ">" +
                            "<div class='total-name'>" + (payment.name ? payment.name : " ") + "</div>" + " " +
                            "<div class='total-amount " + this.$utils.isNegative(pAmount) + "'>" + (!changeAmountZero ? this.$utils.twoDecimals(pAmount) : "") + "</div>" +
                            "</div>"
                        OrderPaymentsDiv.appendChild(paymentDiv);
                    }
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
            "<div class='total-name'>" + (giftCardNum ? (giftCardNum) : " ") + "</div>" +
            "<div class='number-data'>" + cardNum + "</div>" + "</div>"

        giftCardDiv.appendChild(giftCardNumDiv);

        //transaction Num div
        var transactionNumText = this.$translate.getText('TRANSACTION_NO');
        var transactNum = printData.collections.GIFT_CARD_PAYMENTS[0].PROVIDER_TRANS_ID ? printData.collections.GIFT_CARD_PAYMENTS[0].PROVIDER_TRANS_ID : '';
        var transactNumDiv = this._doc.createElement('div');
        transactNumDiv.id = 'transactNumDiv';
        transactNumDiv.innerHTML = "<div class='itemDiv'>" +
            "<div class='total-name'>" + (transactionNumText ? (transactionNumText) : " ") + "</div>" +
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
            amountDiv.innerHTML = "<div class='bold'>" + amountText + ": " + this.$utils.twoDecimals(pAmount) + "</div>"
            mediaExchangeDiv.appendChild(amountDiv);
        }
        if (balanceAmount) {
            balanceDiv.innerHTML = "<div class='bold'>" + balanceText + ": " + this.$utils.twoDecimals(balanceAmount) + "</div>"
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
            "<div class='total-amount " + this.$utils.isNegative(pAmount) + "'>" + this.$utils.twoDecimals(pAmount) + "</div>" +
            "</div>"

        cashDiv.appendChild(cashPaidDiv);

        //Change div
        if (printData.collections.PAYMENT_LIST[0].P_CHANGE && printData.collections.PAYMENT_LIST[0].P_CHANGE !== 0) {
            var changeText = this.$translate.getText('TOTAL_CASHBACK');
            var pChange = printData.collections.PAYMENT_LIST[0].P_CHANGE ? this.$utils.twoDecimals(printData.collections.PAYMENT_LIST[0].P_CHANGE) : '';
            var pChangeZero = printData.collections.PAYMENT_LIST[0].P_CHANGE === 0;
            var transactNumDiv = this._doc.createElement('div')
            transactNumDiv.id = transactNumDiv
            transactNumDiv.innerHTML = "<div class='changeDiv'>" +
                "<div class='total-name'>" + (changeText ? changeText : '') + "</div>" +
                "<div class='total-amount " + this.$utils.isNegative(pChange) + "'>" + (!pChangeZero ? this.$utils.twoDecimals(pChange) : "") + "</div>" +
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
            "<div class='total-amount " + this.$utils.isNegative(pAmount) + "'>" + this.$utils.twoDecimals(pAmount) + "</div>" +
            "</div>"

        chequeDiv.appendChild(chequePaidDiv);

        //Change div
        if (printData.collections.PAYMENT_LIST[0].P_CHANGE && printData.collections.PAYMENT_LIST[0].P_CHANGE !== 0) {
            var changeText = this.$translate.getText('TOTAL_CASHBACK');
            var pChange = printData.collections.PAYMENT_LIST[0].P_CHANGE ? this.$utils.twoDecimals(printData.collections.PAYMENT_LIST[0].P_CHANGE) : '';
            var pChangeZero = printData.collections.PAYMENT_LIST[0].P_CHANGE === 0;
            var tpChangeNumDiv = this._doc.createElement('div')
            tpChangeNumDiv.className += 'tpChangeNumDiv'
            tpChangeNumDiv.innerHTML = "<div class='changeDiv'>" +
                "<div class='total-name'>" + (changeText ? changeText : '') + "</div>" +
                "<div class='total-amount " + this.$utils.isNegative(pChange) + "'>" + (!pChangeZero ? this.$utils.twoDecimals(pChange) : "") + "</div>" +
                "</div>"

            chequeDiv.appendChild(tpChangeNumDiv);
        }

        return chequeDiv;
    }


    createReturnOrderText(printData) {
        var returnOrderDiv = this._doc.createElement('div')

        var isReturnOrderTextDiv = this._doc.createElement('div');
        isReturnOrderTextDiv.id = "isReturnOrderTextDiv";
        isReturnOrderTextDiv.innerHTML = "<div class='bigBold text-center margin-15-0'>" + (this.$translate.getText('RETURN_TRANSACTION')) + "</div>";
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

}
