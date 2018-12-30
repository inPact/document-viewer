import TemplateBuilderService from './templateBuilderService';
import TlogDocsTranslateService from './tlogDocsTranslate';
import BillService from './billService';
import _ from 'lodash';
import Utils from '../helpers/utils.service';

export default class TlogDocsService {

    constructor(options = {}) {
        this._locale;
        this._isUS;
        this._options = options;
        this._configure(options);

        this.$templateBuilder = new TemplateBuilderService(options);
        this.$translate = new TlogDocsTranslateService(options);
        this.$utils = new Utils();
    }

    Enums() {
        return {
            DOC_TYPES: {
                INVOICE: "invoice",
                REFUND_INVOICE: "refundInvoice"
            },
            PaymentTypes: {
                OTH: 'OTH',
                CreditCardPayment: 'CreditCardPayment',
                ChargeAccountPayment: 'ChargeAccountPayment',
                CashPayment: 'CashPayment',
                ChequePayment: 'ChequePayment',
                GiftCardPayment: 'GiftCardPayment',
                ChargeAccountRefund: 'ChargeAccountRefund',
                CashRefund: 'CashRefund',
                ChequeRefund: 'ChequeRefund',
                CreditCardRefund: 'CreditCardRefund',
            }
        }
    }

    _configure(options) {
        if (options.locale) this._locale = options.locale;
        if (options.isUS) this._isUS = options.isUS;

    }
    //Create the Buttons
    orderTypesListCreator(tlog, billData, isClosedOrder) {
        //the array of orders for use of the buttons or other needs
        var orderSelection = [];
        //the type tlog is made for the template builder service which returns regular bill
        if (!isClosedOrder) {
            orderSelection.push({
                tlogId: '',
                id: 'openOrder',
                type: 'tlog',
                title: this.$translate.getText('order') + ' ',
                ep: '',
                isRefund: false,
                isFullOrderBill: false,
            });
        }
        else {
            var checkGiftcardExists = tlog.order &&
                tlog.order.length > 0 &&
                tlog.order[0].allDocuments.length > 0 &&
                tlog.order[0].allDocuments[0].payments.length > 0 &&
                tlog.order[0].allDocuments[0].payments[0]._type === "GiftCard" ? true : false; /// TODO : is gift card only in index 0 ?????
            if (checkGiftcardExists) {
                orderSelection.push({
                    tlogId: tlog._id,
                    id: tlog._id,
                    type: tlog._type,
                    title: this.$translate.getText('order') + ' ' + tlog.number,
                    ep: `tlogs/${tlog._id}/bill`,
                    isRefund: false,
                    isFullOrderBill: true,
                    isGiftCardBill: true
                });
            }
            else {
                orderSelection.push({
                    tlogId: tlog._id,
                    id: tlog._id,
                    type: tlog._type,
                    title: this.$translate.getText('order') + ' ' + tlog.number,
                    ep: `tlogs/${tlog._id}/bill`,
                    isRefund: false,
                    isFullOrderBill: true,
                });

                if (tlog.order[0].clubMembers && tlog.order[0].clubMembers.length) {
                    orderSelection.push({
                        tlogId: tlog._id,
                        id: tlog._id,
                        type: tlog._type,
                        title: this.$translate.getText('clubMembers'),
                        ep: `documents/v2/${doc._id}/printdata`,
                        isRefund: false
                    });
                }

                if (tlog.order[0].checks && tlog.order[0].checks.length > 1) {


                    //set check in split check to 'orderOptions' (the option btns on the PopupBill)
                    tlog.order[0].checks.forEach(check => {
                        let hasPaymentList = check.payments.length > 0 ? true : false;
                        let paymentId = hasPaymentList ? check.payments[0].paymentId : '';
                        orderSelection.push({
                            tlogId: tlog._id,
                            id: check._id,
                            type: 'check',
                            title: this.$translate.getText('CHECK') + ` ${check.number}`, //this.$translate.getText('CHECK') + ` ${check.variables.CHECK_NO}`,
                            ep: `tlogs/${tlog._id}/checks`,
                            md: {
                                paymentId: paymentId,
                                checkNumber: check.number
                            }
                        });
                    });
                }

                let members = tlog.order[0].diners.filter(c => c.member !== undefined && c.member !== null);

                console.log("members");
                console.log(members);
                console.log("members");

                if (members.length > 0) {

                    console.log("members");
                    console.log(members);
                    console.log("members");

                    orderSelection.push({
                        tlogId: tlog._id,
                        id: this.$utils.generateGuid({ count: 3 }),// 'clubMembers', // patch id
                        type: 'clubMembers',
                        title: this.$translate.getText('clubMembers'),
                        ep: `tlogs/${tlog._id}/bill`,
                        isRefund: false
                    });
                }

            }

            if (this._isUS) {
                if (tlog.order) {
                    if (tlog.order[0].allDocuments && tlog.order[0].allDocuments.length > 0) {
                        var _tlog = tlog;
                        tlog.order[0].allDocuments.forEach(document => {
                            if (document.payments.length > 0) {
                                document.payments.forEach(payment => {

                                    var typeTitle = "";
                                    if (payment.tenderType === 'creditCard') typeTitle = this.$translate.getText('CreditSlip');
                                    if (payment.tenderType === 'giftCard') { typeTitle = this.$translate.getText('GiftCardCreditSlip'); }
                                    // if (payment.tenderType === 'giftCard') { typeTitle = this.$translate.getText('GiftCardCreditSlip'); document.id = document.id + 'giftCard' }
                                    if (payment.tenderType === 'creditCard' || payment.tenderType === 'giftCard') {
                                        payment.number = `${tlog.order[0].number}/${payment.number}`;
                                        orderSelection.push({
                                            tlogId: tlog._id,
                                            id: document.id,
                                            type: payment.tenderType,
                                            title: typeTitle + "-" + payment.number,
                                            ep: `documents/v2/${payment._id}/printdata`,
                                            md: {
                                                paymentId: payment._id,
                                                signature: payment && payment.customerSignature ? payment.customerSignature.data : null
                                            },
                                            docPaymentType: (payment.tenderType ? payment.tenderType : ''),
                                            isRefund: payment.tenderType.toUpperCase().includes('REFUND'),
                                            isGiftCardBill: false
                                        });
                                    }
                                })
                            }
                        })
                    }
                }
            }

            if (!this._isUS) {
                if (tlog.order) {
                    if (tlog.order[0].allDocuments && tlog.order[0].allDocuments.length > 0) {

                        // filter payments by ommitted property removes cancelled and refund payments once the order goes shva offline
                        let filteredInvoices = this.filterOmittedPayments(tlog.order[0].allDocuments);
                        filteredInvoices.forEach(doc => {

                            switch (doc._type) {

                                case this.Enums().DOC_TYPES.INVOICE: {
                                    orderSelection.push({
                                        tlogId: tlog._id,
                                        id: doc._id,
                                        type: doc._type,
                                        title: this.$translate.getText('invoice_number') + doc.number,
                                        ep: `documents/v2/${doc._id}/printdata`,
                                        docPaymentType: (doc.payments[0]._type ? doc.payments[0]._type : ''),
                                        isRefund: false
                                    });
                                    break;
                                }

                                case this.Enums().DOC_TYPES.REFUND_INVOICE: {
                                    if (doc.payments[0]._type === 'ChequeRefund' ||
                                        doc.payments[0]._type === 'CashRefund' ||
                                        doc.payments[0]._type === 'CreditCardRefund') {
                                        orderSelection.push({
                                            tlogId: tlog._id,
                                            id: doc._id,
                                            type: doc._type,
                                            title: this.$translate.getText('credit_invoice_number') + doc.number,
                                            ep: `documents/v2/${doc._id}/printdata`,
                                            docPaymentType: doc.payments[0]._type,
                                            isRefund: true
                                        });

                                        break;
                                    }
                                }
                                case 'deliveryNote': {
                                    if (doc.payments[0]._type === 'ChargeAccountPayment') {
                                        orderSelection.push({
                                            tlogId: tlog._id,
                                            id: doc._id,
                                            type: doc._type,
                                            title: this.$translate.getText('delivery_note_number') + doc.number,
                                            ep: `documents/v2/${doc._id}/printdata`,
                                            docPaymentType: doc.payments[0]._type,
                                            isRefund: doc._type.toUpperCase().includes('REFUND')
                                        });


                                        break;
                                    }
                                }
                                case 'refundDeliveryNote': {
                                    if (doc.payments[0]._type === 'ChargeAccountRefund') {
                                        orderSelection.push({
                                            tlogId: tlog._id,
                                            id: doc._id,
                                            type: doc._type,
                                            title: this.$translate.getText('refund_note_number') + doc.number,
                                            ep: `documents/v2/${doc._id}/printdata`,
                                            docPaymentType: doc.payments[0]._type,
                                            isRefund: true
                                        });
                                        break;
                                    }
                                }
                            }


                        })

                    }


                }
            }

        }
        return orderSelection;

    }

    filterOmittedPayments(payments) {

        let omittedOrders = [];

        let filteredItems = payments.forEach(p => {
            if (p.payments[0].providerTransactionStatus === 'omitted') {
                if (p.payments[0]._type === 'CreditCardPayment') {

                    let findRefundPayment = payments.find(r => {
                        return r.payments[0].refundedPaymentId === p.payments[0]._id;
                    })

                    if (findRefundPayment) {
                        omittedOrders.push(p)
                        omittedOrders.push(findRefundPayment)
                    }

                }
            }
        })

        if (omittedOrders.length > 0) {
            omittedOrders.forEach(i => {
                let findPayment = payments.findIndex(p => {
                    return p.id === i.id;
                })
                if (findPayment !== -1) {
                    payments.splice(findPayment, 1)
                }
            })
        }

        return payments;
    }

    //create the data for the documents list

    getDocs(tlog, billData, isClosedOrder) {
        let docsArray;

        let _billService = new BillService(this._options);
        let _enrichPrintData = _billService.resolvePrintData({
            collections: billData.printData.collections,
            variables: billData.printData.variables
        }, this._isUS);

        docsArray = this.orderTypesListCreator(tlog, _enrichPrintData, isClosedOrder);

        return docsArray;

    }

    getHTMLDocument(documentInfo, document, options = {}) {

        return this.$templateBuilder.createHTMLFromPrintDATA(documentInfo, document, options);
    }

    getHTMLDocumentWithoutTlog(document, options = {}) {
        let documentInfo = { isRefund: document.documentType.toUpperCase().indexOf('REFUND') > -1 };
        documentInfo.documentType = document.documentType;

        switch (_.get(document, 'printData.collections.PAYMENT_LIST[0].P_TENDER_TYPE')) {
            case 'cash':
                documentInfo.docPaymentType = 'CashPayment';
                break;
            case 'creditCard':
                documentInfo.docPaymentType = 'CreditCardPayment';
                break;
            case 'giftCard':
                documentInfo.docPaymentType = 'GiftCardPayment';
                break;
            case 'cheque':
                documentInfo.docPaymentType = 'ChequePayment';
                break;
            case 'chargeAccount':
                documentInfo.docPaymentType = 'ChargeAccountPayment';
                break;

        }

        documentInfo.documentNumber = _.get(document, 'printData.variables.DOCUMENT_NO');
        return this.getHTMLDocument(documentInfo, document, options);
    }
}