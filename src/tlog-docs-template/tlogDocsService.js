import TemplateBuilderService from './templateBuilderService';
import TlogDocsTranslateService from './tlogDocsTranslate';
import BillService from './billService';
import _ from 'lodash';
import Utils from '../helpers/utils.service';
import SlipService from '../helpers/slip.service';

export default class TlogDocsService {

    constructor(options = {}) {
        this._locale;
        this._isUS;
        this._realRegion;
        this._options = options;
        this._configure(options);

        this.$templateBuilder = new TemplateBuilderService(options);
        this.$translate = new TlogDocsTranslateService(options);
        this.$utils = new Utils();
        this.$slipService = new SlipService(options);
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
        if (options.realRegion) this._realRegion = options._realRegion;

    }


    //Create the Buttons
    orderTypesListCreator(tlog, options) {

        //the array of orders for use of the buttons or other needs
        var orderSelection = [];
        //the type tlog is made for the template builder service which returns regular bill

        var checkGiftcardExists = tlog.order &&
            tlog.order.length > 0 &&
            tlog.order[0].allDocuments.length === 0
        //&&
        //tlog.order[0].allDocuments[0].payments.length > 0
        //&& tlog.order[0].allDocuments[0].payments[0]._type === "GiftCard" ? true : false; /// TODO : is gift card only in index 0 ?????


        if (checkGiftcardExists) {
            orderSelection.push({
                tlogId: tlog._id,
                id: tlog._id,
                type: tlog._type,
                title: this.$slipService.getTitle({ type: tlog._type, number: tlog.number }),
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
                title: this.$slipService.getTitle({ type: tlog._type, number: tlog.number }),
                ep: `tlogs/${tlog._id}/bill`,
                isRefund: false,
                isFullOrderBill: true,
            });

            if (tlog && tlog.order && tlog.order[0].billText && tlog.order[0].billText.length > 0) {
                orderSelection.push({
                    tlogId: tlog._id,
                    id: tlog._id,
                    type: tlog._type,
                    title: this.$slipService.getTitle({ type: 'billText', number: tlog.number }),
                    ep: `tlogs/${tlog._id}/bill`,
                    isRefund: false,
                    isFullOrderBill: true,
                    billText: _.cloneDeep(tlog.order[0].billText)
                });
            }


            if (tlog.order[0].clubMembers && tlog.order[0].clubMembers.length) {
                orderSelection.push({
                    tlogId: tlog._id,
                    id: tlog._id,
                    type: tlog._type,
                    title: this.$slipService.getTitle({ type: 'clubMembers' }),
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
                        title: this.$slipService.getTitle({ type: 'check', number: check.number }),
                        ep: `tlogs/${tlog._id}/checks`,
                        md: {
                            paymentId: paymentId,
                            checkNumber: check.number
                        }
                    });
                });
            }

            let members = tlog.order[0].diners.filter(c => c.member !== undefined && c.member !== null);

            if (members.length > 0) {

                orderSelection.push({
                    tlogId: tlog._id,
                    id: this.$utils.generateGuid({ count: 3 }),// 'clubMembers', // patch id
                    type: 'clubMembers',
                    title: this.$slipService.getTitle({ type: 'clubMembers' }),
                    ep: `tlogs/${tlog._id}/bill`,
                    isRefund: false,
                    isFakeDocument: true
                });
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
                                    if (payment.tenderType === 'creditCard' || payment.tenderType === 'giftCard') {
                                        payment.number = `${tlog.order[0].number}/${payment.number}`;
                                        orderSelection.push({
                                            tlogId: tlog._id,
                                            id: this.$utils.generateGuid({ count: 3 }),
                                            type: payment.tenderType,
                                            title: this.$slipService.getTitle({ type: payment.tenderType, number: payment.number }),
                                            ep: `documents/v2/${payment._id}/printdata`,
                                            md: {
                                                paymentId: payment._id,
                                                signature: payment && payment.customerSignature ? payment.customerSignature.data : null
                                            },
                                            docPaymentType: (payment.tenderType ? payment.tenderType : ''),
                                            isRefund: payment.tenderType.toUpperCase().includes('REFUND'),
                                            isGiftCardBill: false,
                                            isFakeDocument: true
                                        });

                                        // when _type is mediaExchange we need to remove refunds
                                        if (document._type === 'mediaExchange') {
                                            let paymentIndex = orderSelection.findIndex(p => _.get(p,'md.paymentId') === payment._id);
                                            if(paymentIndex !== -1) {
                                                orderSelection.splice(paymentIndex, 1);
                                            }
                                        }
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
                                        title: this.$slipService.getTitle({ type: this.Enums().DOC_TYPES.INVOICE, number: doc.number }),
                                        ep: `documents/v2/${doc._id}/printdata`,
                                        docPaymentType: (doc.payments[0]._type ? doc.payments[0]._type : ''),
                                        isRefund: false
                                    });
                                    break;
                                }

                                case this.Enums().DOC_TYPES.REFUND_INVOICE: {
                                    if (doc.payments[0]._type === 'ChequeRefund' ||
                                        doc.payments[0]._type === 'CashRefund' ||
                                        doc.payments[0]._type === 'CreditCardRefund' ||
                                        doc.payments[0]._type === 'GiftCardLoad' ||
                                        doc.payments[0]._type === 'CurrencyRefund' ) {
                                        orderSelection.push({
                                            tlogId: tlog._id,
                                            id: doc._id,
                                            type: doc._type,
                                            title: this.$slipService.getTitle({ type: this.Enums().DOC_TYPES.REFUND_INVOICE, number: doc.number }),
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
                                            title: this.$slipService.getTitle({ type: 'deliveryNote', number: doc.number }),
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
                                            title: this.$slipService.getTitle({ type: 'refundDeliveryNote', number: doc.number }),
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

            if (tlog && _.get(tlog, 'order[0].fiscal.transmissions[0]', null)) {
                orderSelection.push({
                    tlogId: tlog._id,
                    id: tlog._id,
                    type: 'fiscal-signature',
                    title: this.$slipService.getTitle({ type: 'fiscalSignature', number: '' }),
                    ep: `tlogs/${tlog._id}/signature`,
                    isRefund: false,
                    isFullOrderBill: true,
                    fiscalSignature: _.cloneDeep(_.get(tlog, 'order[0].fiscal.transmissions[0]', null))
                });
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

    getDocs(tlog, options) {
        let docsArray;

        let _billService = new BillService(this._options);

        docsArray = this.orderTypesListCreator(tlog, options);

        return docsArray;

    }

    getHTMLDocument(documentInfo, printData, options = {}) {
        return this.$templateBuilder.createHTMLFromPrintDATA(documentInfo, printData, options);
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

        let number;
        if (['refundInvoice', 'invoice', 'deliveryNote', 'refundDeliveryNote'].indexOf(document.documentType) > -1) {
            number = document.printData.variables.DOCUMENT_NO;
        } else {
            number = document.printData.variables.ORDER_NO;
        }

        documentInfo.title = this.$slipService.getTitle({ type: documentInfo.documentType, number: number });

        documentInfo.documentNumber = _.get(document, 'printData.variables.DOCUMENT_NO');
        return this.getHTMLDocument(documentInfo, document, options);
    }
}
