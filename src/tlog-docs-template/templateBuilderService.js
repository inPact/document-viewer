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
import HouseAccountPayment from '../services/houseAccountPayment.service';
import RefundDeliveryNote from '../services/templates/RefundDeliveryNote/RefundDeliveryNote';
import BalanceSection from '../services/sections/Balance.section';
import PaymentSection from '../services/sections/Payments.section';
import CreaditSection from '../services/sections/Credit.section';
import ReturnTransactionSection from '../services/sections/ReturnTransaction.section';


import _ from 'lodash';
import QRCode from "qrcode";


export default class TemplateBuilderService {
    constructor(options) {
        this.realRegion = options.realRegion || 'il';
        this._locale;
        this._configure(options);
        this._isGiftCardBill;
        this._isTaxExempt;
        this.$utils = new Utils();
        this.$translate = new TlogDocsTranslateService({locale: this._locale});
        this.$billService = new BillService(options);
        this.$headerService = new HeaderService(options);
        this.$emvService = new EmvService(options);
        this.$vatTemplateService = new VatTemplateService(options);
        this.$creditSlipService = new CreditSlipService(options);
        this.$giftCardSlipService = new GiftCardSlipService(options);
        this.$deliveryNoteTransactionService = new DeliveryNoteTransactionDataService(options);
        this.$signatureService = new SignatureService();
        this.$addTaxData = new AddTaxDataService(options);
        this.$localization = new Localization({ realRegion: this.realRegion });
        this.$htmlCreator = new HtmlCreator();
        this.$creditTransaction = new CreditTransaction(options);
        this.$clubMembersService = new ClubMembersService(options);
        this.$houseAccountPayment = new HouseAccountPayment(options);
        this.$refundDeliveryNote = new RefundDeliveryNote(options);
        this.$refundDeliveryNote = new RefundDeliveryNote(options);
        this.$balanceSection = new BalanceSection(options);
        this.$paymentSection = new PaymentSection(options);
        this.$creaditSection = new CreaditSection(options);
        this.$returnTransactionSection = new ReturnTransactionSection(options);

    }

    _configure(options) {
        if (options.locale) this._locale = options.locale;
    }

    createHTMLFromPrintDATA(documentInfo, printData, options = {}) {
        this._doc = DocumentFactory.get({
            createNew: true,
            documentInfo: documentInfo,
            printData: printData
        });

        if (documentInfo.hasOwnProperty('billText')) {
            this._doc.body.appendChild(this.createTextTemplate(documentInfo))
        } else  if (documentInfo.hasOwnProperty('fiscalSignature')) {
            this._doc.body.appendChild(this.createFiscalSignatureTemplate(documentInfo.fiscalSignature))
        } else {
            this._docObj = documentInfo;
            this._docData = printData;
            this._printData = this.$billService.resolvePrintData(printData.printData, this.realRegion);
            this._printData.isRefund = documentInfo.isRefund;
            let template = this.createDocTemplate(documentInfo, options);
            this._doc.body.appendChild(template);
        }


        return (new XMLSerializer()).serializeToString(this._doc);
    }

    createFiscalSignatureTemplate(documentInfo) {
        var docTemplate = this._doc.createElement('div');
        docTemplate.id = 'docTemplate';
        docTemplate.classList.add('basicTemplate');
        docTemplate.classList += ' ltr';

        let elementVersion = this.$htmlCreator.create({
            type: 'div',
            id: 'version',
            classList: ['hidden-element'],
            value: VERSION
        });

        docTemplate.appendChild(elementVersion);

        let elementFiscalSignature = this.$htmlCreator.create({
            type: 'div',
            id: 'fiscalSignature',
            classList: ['fiscal-signature'],
            value: documentInfo.fiscalSignature
        });

        docTemplate.appendChild(elementFiscalSignature);

        let elementFiscalSignatureTitle = this.$htmlCreator.create({
            type: 'h2',
            id: 'title',
            classList: ['signature-title'],
            value: 'Fiscal Signature',
        });

        elementFiscalSignature.appendChild(elementFiscalSignatureTitle);

        let elementSignature = this.$htmlCreator.create({
            type: 'div',
            id: 'signature',
            classList: ['signature'],
            value: documentInfo.signature
        });
        elementFiscalSignature.appendChild(elementSignature);


        let elementSignatureAddition = this.$htmlCreator.create({
            type: 'div',
            id: 'signatureAddition',
            classList: ['signature-addition'],
            value: documentInfo.signatureAddition
        });
        elementFiscalSignature.appendChild(elementSignatureAddition);


        let elementQR = this.$htmlCreator.create({
            type: 'img',
            id: 'qrcode',
            classList: ['qr'],
        });
        elementFiscalSignature.appendChild(elementQR);

        QRCode.toDataURL(documentInfo.qrLink)
            .then(url => {
                const qrImg = document.getElementById('qrcode');
                elementQR.src = url;
                qrImg.src = url;
            })
            .catch(err => {
                console.error(err)
            })
        return docTemplate;
    }

    createTextTemplate(documentInfo){
        var docTemplate = this._doc.createElement('div');
        docTemplate.id = 'docTemplate';
        docTemplate.classList.add('basicTemplate');
        docTemplate.classList += ' ltr';

        let elementVersion = this.$htmlCreator.create({
            type: 'div',
            id: 'version',
            classList: ['hidden-element'],
            value: VERSION
        });

        docTemplate.appendChild(elementVersion);

        let elementBillText = this.$htmlCreator.create({
            type: 'p',
            id: 'text',
            classList: ['bill-text'],
            value: documentInfo.billText
        });

        docTemplate.appendChild(elementBillText);


        return docTemplate;
    }

    createDocTemplate(docObjChosen, options = {}) {

        let logoUrl = _.get(options, 'logoUrl') || undefined;
        let tabitLogo = _.get(options, 'tabitLogo') || undefined;
        let excludeHeader = _.get(options, 'excludeHeader') || false;
        let excludeFooter = _.get(options, 'excludeFooter') || false;

        this._doc = DocumentFactory.get();

        var docTemplate = this._doc.createElement('div');
        docTemplate.id = 'docTemplate';
        docTemplate.classList.add('basicTemplate');
        docTemplate.classList.add('text-uppercase');

        if (this._locale == 'he-IL') {
            docTemplate.classList += ' rtl'
            docTemplate.classList.remove('ltr')
        } else {
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


        docTemplate.appendChild(elementVersion);


        if (!excludeHeader) {

            if (!_.isEmpty(logoUrl)) {

                let elementImage = this.$htmlCreator.create({
                    type: 'img',
                    id: 'logo',
                    classList: ['logo-image'],
                    attributes: [
                        {key: 'src', value: logoUrl}
                    ]
                });

                let elementImageContainer = this.$htmlCreator.create({
                    type: 'div',
                    id: 'container-logo',
                    classList: ['flex', 'a-center', 'j-center'],
                    children: [
                        elementImage
                    ]
                });

                docTemplate.appendChild(elementImageContainer);
            }

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

            if (docObjChosen.type === "refundDeliveryNote" || docObjChosen.documentType === "refundDeliveryNote") {

                let elementRefundDeliveryNote = this.$refundDeliveryNote.get({
                    isRefund: docObjChosen.isRefund,
                    variables: this._printData.variables,
                    collections: this._printData.collections
                });

                docTemplate.appendChild(elementRefundDeliveryNote);
            } else {
                this._isGiftCardBill = (docObjChosen.isGiftCardBill && docObjChosen.docPaymentType === 'GiftCardPayment') ? true : false;
                this._isTaxExempt = this._printData.data.isTaxExempt;

                var isMediaExchange = (this._printData.variables.ORDER_TYPE === "MEDIAEXCHANGE");
                var isCreditSlip = ((docObjChosen.md && docObjChosen.type === 'creditCard' && !docObjChosen.isFullOrderBill && !docObjChosen.md.checkNumber && !checkInIL) || docObjChosen.documentType === 'creditSlip')

                var isGiftCardSlip = (docObjChosen.type === 'giftCard' && this.$localization.allowByRegions(['us', 'au']));

                if (isMediaExchange && !isCreditSlip && !isGiftCardSlip) {
                    var mediaExchangeDiv = this.createMediaExchange(this._printData, docObjChosen);
                    docTemplate.appendChild(mediaExchangeDiv);

                }
                if (isCreditSlip !== null && isCreditSlip) {
                    var tplCreditSlipTemplate = this.$creditSlipService.createCreditSlip(this._printData, docObjChosen, this._doc);
                    docTemplate.appendChild(tplCreditSlipTemplate);
                } else if (isGiftCardSlip) {
                    var tplGiftCardSlipTemplate = this.$giftCardSlipService.createGiftCardSlip(this._printData, docObjChosen, this._doc);
                    docTemplate.appendChild(tplGiftCardSlipTemplate);
                } else {
                    let tplOrderPaymentData;

                    //create a general template content
                    if (this._printData.variables.ORDER_TYPE.toUpperCase() !== "REFUND") {
                        tplOrderPaymentData  = this.createOrderPaymentData(this._printData);
                        tplOrderPaymentData.id = 'tplOrderPaymentData';
                        let child = tplOrderPaymentData.children[0];

                        if (!child.hasChildNodes()) {
                            tplOrderPaymentData.classList.remove('tpl-body-div');
                        } else {
                            tplOrderPaymentData.classList += ' body-div';
                        }

                    }

                    if (_.get(this._printData.collections, 'RETURNED_OFFERS_LIST', []).length > 0) {

                    }

                    if(_.get(this._printData.collections, 'POINTS_REDEMPTION', []).length > 1){
                        var tplOrderPointsRedeemData = this.createOrderPointsRedeemData(this._printData)
                        tplOrderPointsRedeemData.id = 'tplOrderPointsRedeemData';
                    }

                    var tplOrderReturnItems = this.createReturnItemsData(this._printData);
                    var tplOrderTotals = this.createTotalsData(this._printData, this._isGiftCardBill, this._isTaxExempt);
                    var tplOrderPayments = this.createPaymentsData(this._printData);

                    tplOrderReturnItems.id = 'tplOrderReturnItems';
                    tplOrderTotals.id = 'tplOrderTotals';
                    tplOrderPayments.id = 'tplOrderPayments';

                    //adding styling to the template divs
                    tplOrderReturnItems.hasChildNodes() ? tplOrderReturnItems.classList += ' body-div tpl-body-div' : '';
                    tplOrderTotals.hasChildNodes() ? tplOrderTotals.classList += ' body-div tpl-body-div' : '';
                    tplOrderPayments.hasChildNodes() ? tplOrderPayments.classList += ' body-div tpl-body-div' : '';

                    //set body main divs

                    tplOrderPaymentData && tplOrderPaymentData.hasChildNodes() ? docTemplate.appendChild(tplOrderPaymentData) : null;
                    tplOrderPointsRedeemData && tplOrderPointsRedeemData.hasChildNodes() ?docTemplate.appendChild(tplOrderPointsRedeemData) : null;
                    tplOrderReturnItems.hasChildNodes() ? docTemplate.appendChild(tplOrderReturnItems) : null;
                    tplOrderTotals.hasChildNodes() ? docTemplate.appendChild(tplOrderTotals) : null;
                    tplOrderPayments.hasChildNodes() ? docTemplate.appendChild(tplOrderPayments) : null;

                    /// ADD Balance Section to tempalte.
                    if ((docObjChosen.isFullOrderBill || this._docObj.type === 'check') &&
                        this._printData.variables.BAL_DUE &&
                        this._printData.collections.PAYMENT_LIST.length > 0
                    ) {

                        let balanceSection = this.$balanceSection.get({
                            variables: this._printData.variables,
                            collections: this._printData.collections,
                        });

                        docTemplate.appendChild(balanceSection);

                    }

                    //if gift card
                    if (this._isGiftCardBill) {
                        if (this.$localization.allowByRegions(['us', 'au'])) {
                            var inclusiveTaxesDiv = this.$addTaxData.createInclusiveTaxFunc(this._printData, this._doc);
                            var exmemptTaxesDiv = this.$addTaxData.createTaxExemptFunc(this._printData, this._doc);

                            if (inclusiveTaxesDiv !== null) docTemplate.appendChild(inclusiveTaxesDiv)
                            if (exmemptTaxesDiv !== null) docTemplate.appendChild(exmemptTaxesDiv)
                        }
                    }

                    //if tax exempt
                    if (this._isTaxExempt) {
                        if (this.$localization.allowByRegions(['us', 'au'])) {
                            var exmemptTaxesDiv = this.$addTaxData.createTaxExemptFunc(this._printData, this._doc);
                            if (exmemptTaxesDiv !== null) docTemplate.appendChild(exmemptTaxesDiv)
                        }
                    }

                    if (this._printData.data.taxes.InclusiveTaxes && this._printData.data.taxes.InclusiveTaxes.length > 0) {
                        if (this.$localization.allowByRegions(['us', 'au'])) {
                            var inclusiveTaxesDiv = this.$addTaxData.createInclusiveTaxFunc(this._printData, this._doc);
                            if (inclusiveTaxesDiv !== null) docTemplate.appendChild(inclusiveTaxesDiv)
                        }
                    }


                    if (this._printData.variables.CUSTOMER_MESSAGE && docObjChosen.isFullOrderBill) {
                        var customerMessageDiv = this.createCustomerMessage(this._printData, this._doc);
                        if (customerMessageDiv !== null) docTemplate.appendChild(customerMessageDiv)
                    }


                    if (this._docData.documentType === 'refundDeliveryNote') {

                        /**
                         * Add House Account Payment Section.
                         */
                        if (_.get(this, '_printData.collections.HOUSE_ACCOUNT_PAYMENTS[0]')) {

                            let elementHouseAccountPayment = this.$houseAccountPayment.get({
                                variables: this._printData.variables,
                                collections: this._printData.collections
                            })

                            docTemplate.appendChild(elementHouseAccountPayment);
                        }

                    }
                }


                if (isMediaExchange &&
                    docObjChosen.isFullOrderBill &&
                    this._printData.collections.PAYMENT_LIST &&
                    this._printData.collections.PAYMENT_LIST.length > 0 &&
                    this._printData.collections.PAYMENT_LIST.find(p => p.EMV !== undefined)) {
                    let documentType = 'orderBill'
                    docTemplate.appendChild(this.$emvService.createEmvTemplate(documentType, this._printData, this._doc));
                } else if (
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


                    let elementReturnTransaction = this.$returnTransactionSection.get({
                        variables: this._printData.variables,
                        collections: this._printData.collections
                    });

                    docTemplate.appendChild(elementReturnTransaction);
                }

                if (isMediaExchange && !isCreditSlip && !isGiftCardSlip) {

                    let payments = _.get(this._printData, 'collections.PAYMENT_LIST');
                    let giftCardPayment = payments.find(c => c.P_TENDER_TYPE === "creditCard");

                    if (giftCardPayment) {

                        let elementCreditTransaction = this.$creditTransaction.get({
                            realRegion: this.realRegion,
                            data: giftCardPayment
                        });

                        docTemplate.appendChild(elementCreditTransaction);

                    }

                }

            }

        }

        // document order number
        if (this._printData.variables.ORDER_COUNTER && this.realRegion === 'gr') {
            let docOrderNumberFooterText = this.$htmlCreator.create({
                type: 'div',
                id: 'counter-site-footer-text',
                classList: ['text', 'flex-center'],
                value: this.$translate.getText('order_counter') + " "  + this._printData.variables.ORDER_COUNTER
            });

            docTemplate.appendChild(docOrderNumberFooterText);
        }
        if (this._printData.variables.FISCAL_COUNTER && (this.realRegion === 'gr' || this.realRegion === 'il')) {
            let docOrderNumberFooterText = this.$htmlCreator.create({
                type: 'div',
                id: 'counter-site-footer-text',
                classList: ['text', 'flex-center'],
                value: this.$translate.getText('fiscal_counter') + " "  + this._printData.variables.FISCAL_COUNTER
            });

            docTemplate.appendChild(docOrderNumberFooterText);
        }


        // Footer Element

        if (!excludeFooter && tabitLogo !== undefined) {

            let elementFooterText = this.$htmlCreator.create({
                type: 'div',
                id: 'element-footer-text',
                classList: ['text'],
                value: 'Powered by'
            });

            let elementFooterImage = this.$htmlCreator.create({
                type: 'img',
                id: 'element-footer-image',
                classList: ['tabit-logo'],
                attributes: [
                    {key: 'src', value: tabitLogo}
                ]
            });

            let elementFooter = this.$htmlCreator.create({
                type: 'div',
                id: 'element-footer',
                classList: ['flex', 'a-center', 'j-center', 'footer'],
                children: [
                    elementFooterImage,
                    elementFooterText
                ]
            });

            let elemenFooterContainer = this.$htmlCreator.create({
                type: 'div',
                id: 'container-footer',
                classList: ['flex', 'a-center', 'j-center'],
                children: [
                    elementFooter
                ]
            });

            docTemplate.appendChild(elemenFooterContainer);

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
        paymentDataDiv.classList += ' border-bottom';
        paymentDataDiv.classList += ' tpl-body-div';

        tplOrderPaymentData.appendChild(paymentDataDiv);

        if (this._docObj && !(this._docData.documentType === "deliveryNote")) {
            this.fillItemsData(paymentDataDiv, data, printData);
        } else if (this._docObj && (this._docData.documentType === "deliveryNote" || this._docData.documentType === "refundDeliveryNote")) {

            this.fillItemsData(paymentDataDiv, data, printData);

            var delNoteTransDiv = this.$deliveryNoteTransactionService.createDeliveryNoteTransactionData({
                IS_REFUND: printData.isRefund
            });

            tplOrderPaymentData.appendChild(delNoteTransDiv);
            paymentDataDiv.classList += ' border-bottom';
        }

        return tplOrderPaymentData;
    }

    createOrderPointsRedeemData(printData) {

        var tplPointsRedeemData = this._doc.createElement('div');
        let data = this.$billService.resolveItems(printData.variables, printData.collections);

        tplPointsRedeemData.classList += ' tpl-body-div';
    
        var PointsRedeemDataDiv = this._doc.createElement('div');
        PointsRedeemDataDiv.id = "PointsRedeemDataDiv";
        PointsRedeemDataDiv.classList += ' padding-top';
        PointsRedeemDataDiv.classList += ' border-bottom';
        PointsRedeemDataDiv.classList += ' tpl-body-div';
        PointsRedeemDataDiv.innerHTML = `<div class='bold'>${this.$translate.getText('POINTS_REDEMPTION')}</div>`;

        this.fillPointsRedeemData(PointsRedeemDataDiv, data);
        tplPointsRedeemData.appendChild(PointsRedeemDataDiv);

        return tplPointsRedeemData;
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

                    // remove special chars (html chars as it not render)
                    let itemName = _.get(item, 'name', '');
                    let name = itemName.replace(/</ig, '').replace(/>/ig, '');
                    let elementItemName = this.$htmlCreator.create({
                        type: 'div',
                        id: `item-name-${index}`,
                        classList: ['item-name'],
                        value: item.isOffer ? `${name || ''}` : `&nbsp;&nbsp;${name || ''}`
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
                        value: item.isOTH ? this.$translate.getText('OTH') : this.$utils.twoDecimals(item.amount)
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
                        var weightPerUnitTranslate = this.$localization.allowByRegions(['us', 'au']) ? this.$translate.getText('dlrPerlb') : this.$translate.getText('ilsToKg')
                        var weightTranslate = this.$localization.allowByRegions(['us', 'au']) ? this.$translate.getText('lb') : weightCalculatedUnit;

                        var weightText = '';
                        if (this.$localization.allowByRegions(['us', 'au'])) {
                            weightText = `${calcWeight}[${weightTranslate}] @ ${this.$localization.getSymbol()}${item.weightAmount}/${weightTranslate}`;
                        } else {
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

    fillPointsRedeemData(htmlElement, data) {
        data.pointsRedeem.forEach(prItem => {
            var prItemDiv = this._doc.createElement('div');
            prItemDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='item-qty' style='flex: 3;'>" + (prItem.CUSTOMER_NAME ? prItem.CUSTOMER_NAME : " ") + "</div>" + " " +
                "<div class='item-name'>" + (prItem.CARD_NUMBER ? prItem.CARD_NUMBER : "") + "</div>" + " " +
                "<div class='total-amount'>" + (prItem.REDEEMED_POINTS ? prItem.REDEEMED_POINTS : "") + "</div>" +
                "</div>"

            htmlElement.appendChild(prItemDiv);
        });
    }

    createCreditTemplate(printData) {

        return this.$creaditSection.get({
            collections: printData.collections,
            variables: printData.variables,
            isRefund: printData.printData,
            documentInfo: this._docData
        });
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
        } else if (creditData) {

            let elementCreditTransaction = this.$creditTransaction.get({
                realRegion: this.realRegion,
                data: creditData
            });

            creditDataDiv.appendChild(elementCreditTransaction);
        }

        return creditDataDiv
    }

    createTotalsData(printData, isGiftCardBill, isTaxExempt) {
        var tplOrderTotals = this._doc.createElement('div');
        tplOrderTotals.id = 'tplOrderTotals';
        tplOrderTotals.hasChildNodes() ? tplOrderTotals.classList += ' tpl-body-div' : '';

        if(this.$localization.allowByRegions( ['au']) && this._docData.documentType === 'orderBill' && printData.variables.ORDER_TYPE === 'MEDIAEXCHANGE'){
            return tplOrderTotals;
        }

        if (this._docObj && [
            'invoice',
            'CreditCardPayment',
            'CreditCardRefund',
            'CashPayment',
            'GiftCard',
            'CashRefund',
            'ChequePayment',
            'ChequeRefund',
            'refundInvoice'
        ].indexOf(this._docData.documentType) > -1) {
            var vatTemplateDiv = this.$vatTemplateService.createVatTemplate({
                isRefund: printData.isRefund,
                printData: printData
            });

            tplOrderTotals.appendChild(vatTemplateDiv);
        } else if (this._docObj && (this._docData.documentType === 'deliveryNote')) {
            return tplOrderTotals;
        } else {
            var OrderTotalsDiv = this._doc.createElement('div');
            OrderTotalsDiv.id = "OrderTotalsDiv";
            tplOrderTotals.appendChild(OrderTotalsDiv);
            OrderTotalsDiv.hasChildNodes() ? OrderTotalsDiv.classList += " tpl-body-div" : '';

            this.fillOrderTotals(OrderTotalsDiv, printData);
        }
        return tplOrderTotals;
    }

    createReturnItemsData(printData) {
        // here
        var returnItems = this._doc.createElement('div');

        const returnOffers = _.get(printData, 'collections.RETURNED_OFFERS_LIST', []);
        const items = [];
        returnOffers.forEach(o => {
            items.push({
                qty: 1,
                name: o['OFFER_NAME'],
                amount: o['OFFER_AMOUNT'],
                isOffer: true,
            })

            if (o.RETURNED_OFFER_DISCOUNTS && o.RETURNED_OFFER_DISCOUNTS.length > 0) {
                o.RETURNED_OFFER_DISCOUNTS.forEach(discount => {
                    items.push({
                        isOfferDiscount: true,
                        name: discount.DISCOUNT_NAME ? discount.DISCOUNT_NAME : this.$translate.getText('MANUAL_ITEM_DISCOUNT'),
                        qty: null,
                        amount: this.$utils.toFixedSafe(discount.DISCOUNT_AMOUNT, 2)
                    })
                });
            }

            const OrderedItemsList = _.get(o, 'ORDERED_ITEMS_LIST', []);
            OrderedItemsList.forEach(i => {
                items.push({
                    qty: 1,
                    name: i['ITEM_NAME'],
                    amount: '',
                    isOffer: false,
                })
            })
        })

        items.forEach((item, index) => {

            if (item.isOffer) {
                // Return items Header
                const returnItemsHeader = this._doc.createElement('div');
                returnItemsHeader.id = "returnItemsHeader";
                returnItemsHeader.innerHTML = this.$translate.getText('ReturnedItem');
                returnItemsHeader.style.margin = index === 0 ? "0px 0 5px 0" : "10px 0 5px 0";
                returnItemsHeader.classList += "bold";
                returnItems.append(returnItemsHeader);
            }

            let elementItemQty = this.$htmlCreator.create({
                type: 'div',
                id: `item-qty-${index}`,
                classList: ['item-qty'],
                value: item.qty
            });

            // remove special chars (html chars as it not render)
            let itemName = _.get(item, 'name', '');
            let name = itemName.replace(/</ig, '').replace(/>/ig, '');
            let elementItemName = this.$htmlCreator.create({
                type: 'div',
                id: `item-name-${index}`,
                classList: ['item-name'],
                value: item.isOffer ? `${name || ''}` : `&nbsp;&nbsp;${name || ''}`
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
            returnItems.appendChild(elementItemContainer);
        })
        return returnItems
    }

    fillOrderTotals(htmlElement, printData) {
        if (printData.data.totals.length > 0) {
            printData.data.totals.forEach(total => {
                var isCheckTotal = total.name === 'Check Total';

                var totalDiv = this._doc.createElement('div');
                if (total.type === 'exclusive_tax') {
                    totalDiv.innerHTML = "<div class='itemDiv small-chars'>" +
                        "<div class='total-name'>" + "&nbsp;&nbsp;" + (total.name ? total.name : " ") + " " + (total.rate ? this.$utils.getDecimals(total.rate, 3) + "%" : " ") + "</div>" + " " +
                        "<div class='total-amount " + this.$utils.isNegative(total.amount) + "'>" + (total.amount ? this.$utils.twoDecimals(total.amount) : " ") + "</div>" + "</div>"
                } else if (total.type !== 'exclusive_tax') {
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
        } else if (this._docObj && ["invoice", "refundInvoice", 'refundDeliveryNote'].indexOf(this._docData.documentType) > -1) {

            if (this._docObj.docPaymentType === "CreditCardPayment" || this._docObj.docPaymentType === "CreditCardRefund") {
                var creditPaymentDiv = this.createCreditTemplate(printData);
                tplOrderPaymentsDiv.appendChild(creditPaymentDiv);

                const hasSignature = _.get(this, '_docObj.md.signature') || _.get(printData, 'collections.PAYMENT_LIST[0].SIGNATURE_DATA');
                if (hasSignature && this.$localization.allowByRegions(['il']) && ["CreditCardPayment", "CreditCardRefund"].indexOf(this._docObj.docPaymentType) > -1) {
                    var signatureArea = this._doc.createElement('div');
                    signatureArea.id = 'signatureArea';
                    signatureArea.className += ' item-div';

                    tplOrderPaymentsDiv.appendChild(signatureArea);
                    tplOrderPaymentsDiv.appendChild(this.$signatureService.getSignature(signatureArea));
                }
            } else if (this._docObj.docPaymentType === ("GiftCard")) {
                var giftCardPayment = this.createGiftCardDetails(printData);
                tplOrderPaymentsDiv.appendChild(giftCardPayment);
            } else if (['CashPayment', 'CashRefund'].includes(this._docObj.docPaymentType)) {
                var cashPayment = this.createCashPaymentFooter(printData);
                tplOrderPaymentsDiv.appendChild(cashPayment);
            } else if (['CurrencyPayment', 'CurrencyRefund'].includes(this._docObj.docPaymentType)) {
                const currencyPayments = printData.data.payments.filter(payment => payment.P_TENDER_TYPE === 'currency');
                currencyPayments.forEach(payment => {
                    const isRefund = this._docObj.docPaymentType === 'CurrencyRefund';
                    const currencyPaymentDetailsSection = this.createCurrencyPaymentSection(payment, isRefund);
                    tplOrderPaymentsDiv.appendChild(currencyPaymentDetailsSection);
                });


            } else if (this._docObj.docPaymentType === "ChequePayment" || this._docObj.docPaymentType === "ChequeRefund") {
                var chequePayment = this.createChequePaymentFooter(printData);
                tplOrderPaymentsDiv.appendChild(chequePayment);
            }

        } else {
            let paymentSection = this.$paymentSection.get({
                variables: this._printData.variables,
                collections: this._printData.collections,
                payments: this._printData.data.payments,
                documentInfo: this._docData
            });

            tplOrderPaymentsDiv.appendChild(paymentSection);
        }

        return tplOrderPaymentsDiv;
    }

    createCurrencyPaymentSection(payment, isRefund) {
        var currencyDiv = this._doc.createElement('div');
        currencyDiv.id = 'currencyDiv'

        var currencySymbol = payment.CURRENCY_SYMBOL;

        var pAmount = !isRefund ? payment.amount : payment.P_AMOUNT;
        var currencyPaidDiv = this._doc.createElement('div')
        currencyPaidDiv.innerHTML = "<div class='itemDiv'>" +
            "<div class='total-name bold'>" + this.$translate.getText(`CURRENCY_PAYMENT_LABEL_${currencySymbol}`) + "</div>" +
            "<div class='total-amount " + this.$utils.isNegative(pAmount) + "'>" + this.$utils.twoDecimals(pAmount) + "</div>" +
            "</div>"

        currencyDiv.appendChild(currencyPaidDiv);

        const currencyValue = this.$utils.toFixedSafe(payment.CURRENCY_FACE_VALUE, 2);
        const currencyRate = this.$utils.toFixedSafe(payment.CURRENCY_RATE, 3);

        var currencyPaymentDetailsDiv = this._doc.createElement('div');
        currencyPaymentDetailsDiv.innerHTML = '<div class="bold">' + this.$translate.getText(`CURRENCY_PAYMENT_DETAILS_${payment.CURRENCY_SYMBOL}`,
            ['currencyAmount', 'currencySymbol', 'currencyRate'],
            [currencyValue, payment.CURRENCY_SYMBOL, currencyRate]) + '</div>';

        currencyDiv.appendChild(currencyPaymentDetailsDiv);
        const cashbackDiv = this.totalCashbackTemplate(payment);
        if (cashbackDiv) {
            currencyDiv.appendChild(cashbackDiv);
        }

        return currencyDiv;
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

        let printMessage;
        let pName;
        let cardNumber;
        let censoredCardNumber;
        let pAmount;
        let balanceAmount;
        let providerTransId;

        if (printData.collections.PAYMENT_LIST && printData.collections.PAYMENT_LIST.length > 0) {
            printData.collections.PAYMENT_LIST.forEach(payment => {
                if (payment.P_TENDER_TYPE === 'giftCard') {
                    printMessage = payment.PRINT_MESSAGE.replace(/\n/ig, '<br/>');
                    pName = payment.P_NAME;
                    cardNumber = payment.CARD_NUMBER;
                    censoredCardNumber = payment.CARD_NUMBER.slice(-4).padStart(10, 'XXXXX-');
                    pAmount = payment.P_AMOUNT;
                    balanceAmount = payment.BALANCE_AMOUNT;
                    providerTransId = payment.PROVIDER_TRANS_ID
                }
            });
        }

        let mediaExchangeDiv = this._doc.createElement('div');
        mediaExchangeDiv.id = 'mediaExchangeDiv';

        //set texts for the divs
        let giftCardText = pName;
        let cardNumberText = this.$translate.getText('card_number');
        let amountText = this.$translate.getText('amount');
        let balanceText = this.$translate.getText('Balance');

        //create div to append
        let pNameDiv = this._doc.createElement('div');
        let amountDiv = this._doc.createElement('div');
        let cardNumberDiv = this._doc.createElement('div');
        let balanceDiv = this._doc.createElement('div');
        let printMsgDiv = this._doc.createElement('div');
        let referenceDiv = this._doc.createElement('div');

        if(this.$localization.allowByRegions(['au'])) {

            if (pAmount) {
                pNameDiv.innerHTML = "<div class='padding-top bold flex j-sb'>" +
                    " <div>"+ this.$translate.getText('card_load') + "</div>" +
                    "<div>"+  this.$utils.twoDecimals(pAmount) +"</div>" +
                    "</div>"
            }

            if (censoredCardNumber) {
                cardNumberDiv.innerHTML = "<div class='m-inline-start-5'>" + this.$translate.getText('card_no') + " " + censoredCardNumber + "</div>"
            }

            if (balanceAmount) {
                balanceDiv.innerHTML = "<div class='m-inline-start-5'>" + this.$translate.getText('REMAINING_BALANCE') + " " + this.$utils.twoDecimals(balanceAmount) + "</div>"
            }

            if (providerTransId) {
                referenceDiv.innerHTML =  "<div class='m-inline-start-5'>" + this.$translate.getText('REFERENCE') + " " + providerTransId + "</div>"
            }

            mediaExchangeDiv.appendChild(pNameDiv);
            mediaExchangeDiv.appendChild(cardNumberDiv);
            mediaExchangeDiv.appendChild(balanceDiv);
            mediaExchangeDiv.appendChild(referenceDiv);

            return mediaExchangeDiv;
        }

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

        // Payment Rounding Div //
        if(printData.variables.TOTAL_ROUNDING){
            const paymentRoundingDiv = this._doc.createElement('div');
            paymentRoundingDiv.className = 'paymentRoundingDiv'

            const paymentRoundingText = this.$translate.getText('ROUNDING');
            const paymentRoundingAmount = printData.variables.TOTAL_ROUNDING + ''

            paymentRoundingDiv.innerHTML = "<div class='total-name'>" + paymentRoundingText + "</div>" +
                "<div class='total-amount'>" + paymentRoundingAmount + "</div>"

            cashDiv.appendChild(paymentRoundingDiv);
        }

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

    totalCashbackTemplate(payment) {
        const paymentChange = _.get(payment, 'P_CHANGE', 0);
        if (paymentChange !== 0) {
            var changeText = this.$translate.getText('TOTAL_CASHBACK');
            var pChange = paymentChange ? this.$utils.twoDecimals(paymentChange) : '';
            var cashbackDiv = this._doc.createElement('div')
            cashbackDiv.id = 'cashback-div'
            cashbackDiv.innerHTML = "<div class='changeDiv'>" +
                "<div class='total-name'>" + (changeText ? changeText : '') + "</div>" +
                "<div class='total-amount " + this.$utils.isNegative(pChange) + "'>" + this.$utils.twoDecimals(pChange) + "</div>" +
                "</div>"

            return cashbackDiv;
        }
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

    createCustomerMessage(printData, doc) {
        if (printData.variables.CUSTOMER_MESSAGE) {
            var customerMessage = this.breakCustomerMessageFilter(printData.variables.CUSTOMER_MESSAGE);
            var customerMessageDataDiv = doc.createElement('div');
            customerMessageDataDiv.innerHTML = "<div class='customerMessage'>" + customerMessage + "</div>"

            return customerMessageDataDiv;
        } else return null;

    }

    breakCustomerMessageFilter(str) {
        if (!str) return '';

        return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br\/>$2');
    }
}
