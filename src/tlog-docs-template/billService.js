import Utils from '../helpers/utils.service';
import TlogDocsTranslateService from './tlogDocsTranslate';
import moment from 'moment';

export default class BillService {
    constructor(options) {
        this._isUS = options.isUS === undefined ? true : options.isUS;
        this._locale = options.locale;
        this.$utils = new Utils();
        this.$translate = new TlogDocsTranslateService(options);
    }

    Enums() {
        return {
            PaymentTypes: {
                OTH: 'OTH',
                CreditCardPayment: 'CreditCardPayment',
                ChargeAccountPayment: 'ChargeAccountPayment',
                CashPayment: 'CashPayment',
                ChequePayment: 'ChequePayment',
                ChargeAccountRefund: 'ChargeAccountRefund',
                CashRefund: 'CashRefund',
                ChequeRefund: 'ChequeRefund',
                CreditCardRefund: 'CreditCardRefund',
            },
            OrderTypes: {
                Refund: "Refund",
                TA: "TA",
                Delivery: "Delivery",
                Seated: "Seated",
                OTC: "OTC"
            },
            ReturnTypes: {
                Cancellation: 'cancellation',
                TransactionBased: "TRANSACTION BASED"
            },
            DiscountTypes: {
                OTH: "OTH",
            },
            OfferTypes: {
                Simple: "Simple",
                Combo: 'Combo',
                ComplexOne: 'Complex-One'
            },
            TransTypes: {
                Reversal: "Reversal",
                Return: "Return"
            },
            Sources: {
                TabitPay: "tabitPay"
            }
        }
    }

    resolveItems(variables, collections) {
        let isReturnOrder = false;
        if (variables.RETURN_TYPE === this.Enums().ReturnTypes.TransactionBased) {
            isReturnOrder = true;
        }

        let offersList = collections.ORDERED_OFFERS_LIST;
        if (isReturnOrder) {
            offersList = collections.RETURNED_OFFERS_LIST;
        }

        let isTaxExempt = false;
        if ((collections.EXEMPTED_TAXES && collections.EXEMPTED_TAXES.length > 0 && this._isUS)) {
            isTaxExempt = true;
        }

        let items = [];
        let oth = [];

        if (offersList && offersList.length > 0) {
            offersList.forEach(offer => {

                let isSplitCheck = false;
                let isWeight = false;

                if (offer.OFFER_UNITS !== undefined && offer.OFFER_UNITS !== null) {
                    isWeight = true;
                }

                let offerQty = 0;
                if (offer.SPLIT_DENOMINATOR && offer.SPLIT_NUMERATOR && offer.SPLIT_DENOMINATOR !== 100 && offer.SPLIT_NUMERATOR !== 100) {
                    offerQty = `${offer.SPLIT_NUMERATOR}/${offer.SPLIT_DENOMINATOR}`;
                    isSplitCheck = true;
                } else {
                    offerQty = offer.OFFER_QTY;
                }
                if (offer.OFFER_TYPE == this.Enums().OfferTypes.Simple) {
                    let item = {
                        isOffer: true,
                        name: offer.OFFER_NAME,
                        qty: offerQty
                    };

                    if (offer.ON_THE_HOUSE) {
                        item.amount = this.$translate.getText('OTH');
                        oth.push(item)
                    } else {

                        if (isReturnOrder || isWeight) {
                            item.amount = this.$utils.toFixedSafe(offer.OFFER_AMOUNT, 2)
                            items.push(item);
                        }
                        else if (offer.OFFER_CALC_AMT !== 0 && offer.OFFER_CALC_AMT !== null && isSplitCheck === false) { // if the offer amount is 0 not need to show 
                            item.amount = this.$utils.toFixedSafe(offer.OFFER_CALC_AMT, 2)
                            items.push(item);
                        } else if (isSplitCheck === true) {
                            item.amount = this.$utils.toFixedSafe(offer.OFFER_AMOUNT, 2)
                            items.push(item);
                        }

                        if (offer.OPEN_PRICE) {
                            item.amount = this.$utils.toFixedSafe(offer.OFFER_AMOUNT, 2)
                            items.push(item);
                        }
                    }

                    if (offer.ORDERED_OFFER_DISCOUNTS && offer.ORDERED_OFFER_DISCOUNTS.length > 0) {
                        offer.ORDERED_OFFER_DISCOUNTS.forEach(discount => {
                            items.push({
                                isOfferDiscount: true,
                                name: discount.DISCOUNT_NAME ? discount.DISCOUNT_NAME : this.$translate.getText('MANUAL_ITEM_DISCOUNT'),
                                qty: null,
                                amount: this.$utils.toFixedSafe(discount.DISCOUNT_AMOUNT * -1, 2)
                            })
                        });
                    }

                    if (offer.EXTRA_CHARGE_LIST && offer.EXTRA_CHARGE_LIST.length > 0) {
                        offer.EXTRA_CHARGE_LIST.forEach(extraCharge => {

                            if (extraCharge.EXTRA_CHARGE_MODIFIERS_LIST && extraCharge.EXTRA_CHARGE_MODIFIERS_LIST.length > 0) {
                                extraCharge.EXTRA_CHARGE_MODIFIERS_LIST.forEach(modifier => {
                                    items.push({
                                        isItem: true,
                                        name: modifier.MODIFIER_NAME,
                                        qty: null,
                                        amount: item.ON_THE_HOUSE ? this.$translate.getText('OTH') : this.$utils.toFixedSafe(modifier.MODIFIER_PRICE, 2)
                                    });

                                    if (modifier.MODIFIER_DISCOUNTS && modifier.MODIFIER_DISCOUNTS.length > 0) {
                                        modifier.MODIFIER_DISCOUNTS.forEach(discount => {
                                            items.push({
                                                isItem: true,
                                                name: discount.DISCOUNT_NAME,
                                                qty: null,
                                                amount: item.ON_THE_HOUSE ? this.$translate.getText('OTH') : this.$utils.toFixedSafe(discount.DISCOUNT_AMOUNT * -1, 2)
                                            });
                                        });
                                    }

                                })
                            }
                            if (extraCharge.ITEM_DISCOUNTS && extraCharge.ITEM_DISCOUNTS.length > 0) {
                                extraCharge.ITEM_DISCOUNTS.forEach(discount => {
                                    items.push({
                                        isItem: true,
                                        name: discount.DISCOUNT_NAME,
                                        qty: null,
                                        amount: this.$utils.toFixedSafe(discount.DISCOUNT_AMOUNT * -1, 2)
                                    })
                                })
                            }

                        });
                    }

                }

                if ([this.Enums().OfferTypes.ComplexOne, this.Enums().OfferTypes.Combo].indexOf(offer.OFFER_TYPE) > -1) {


                    let item = {
                        isOffer: true,
                        name: offer.OFFER_NAME,
                        qty: offerQty
                    }

                    if (offer.ON_THE_HOUSE) {
                        item.amount = this.$translate.getText('OTH');
                        oth.push(item)
                    } else {

                        if (isReturnOrder) {
                            item.amount = this.$utils.toFixedSafe(isReturnOrder ? offer.OFFER_AMOUNT : offer.OFFER_AMOUNT, 2);
                            items.push(item);
                        } else if (offer.OFFER_CALC_AMT !== 0 && offer.OFFER_CALC_AMT !== null && isSplitCheck === false) { // if the offer amount is 0 not need to show 
                            item.amount = this.$utils.toFixedSafe(offer.OFFER_CALC_AMT, 2);
                            items.push(item);
                        } else if (isSplitCheck === true) {
                            item.amount = this.$utils.toFixedSafe(offer.OFFER_AMOUNT, 2);
                            items.push(item);
                        }

                        if (offer.OPEN_PRICE) {
                            item.amount = this.$utils.toFixedSafe(offer.OFFER_AMOUNT, 2);
                            items.push(item);
                        }
                    }

                    if (!isReturnOrder) {
                        if (offer.ORDERED_ITEMS_LIST && offer.ORDERED_ITEMS_LIST.length > 0)
                            offer.ORDERED_ITEMS_LIST.forEach(item => {
                                items.push({
                                    isItem: true,
                                    name: item.ITEM_NAME,
                                    qty: null,
                                    amount: null
                                })
                            });
                    }

                    if (!isReturnOrder) {

                        if (offer.EXTRA_CHARGE_LIST && offer.EXTRA_CHARGE_LIST.length > 0) {
                            offer.EXTRA_CHARGE_LIST.forEach(item => {

                                if (item.EXTRA_CHARGE_MODIFIERS_LIST && item.EXTRA_CHARGE_MODIFIERS_LIST.length > 0) {
                                    item.EXTRA_CHARGE_MODIFIERS_LIST.forEach(modifier => {
                                        items.push({
                                            isItem: true,
                                            name: modifier.MODIFIER_NAME,
                                            qty: null,
                                            amount: item.ON_THE_HOUSE ? this.$translate.getText('OTH') : this.$utils.toFixedSafe(item.ITEM_AMOUNT, 2)
                                        })
                                    })
                                }
                                else if (item.ITEM_DISCOUNTS && item.ITEM_DISCOUNTS.length > 0) {

                                    items.push({
                                        isItem: true,
                                        name: item.ITEM_NAME,
                                        qty: null,
                                        amount: this.$utils.toFixedSafe(item.ITEM_AMOUNT, 2)
                                    })

                                    if (item.ITEM_DISCOUNTS && item.ITEM_DISCOUNTS.length > 0) {
                                        item.ITEM_DISCOUNTS.forEach(discount => {
                                            items.push({
                                                isItem: true,
                                                name: discount.DISCOUNT_NAME,
                                                qty: null,
                                                amount: this.$utils.toFixedSafe(discount.DISCOUNT_AMOUNT * -1, 2)
                                            })
                                        })
                                    }
                                }
                                else {
                                    items.push({
                                        isItem: true,
                                        name: item.ITEM_NAME,
                                        qty: null,
                                        amount: item.ON_THE_HOUSE ? this.$translate.getText('OTH') : this.$utils.toFixedSafe(item.ITEM_AMOUNT, 2)
                                    })
                                }

                            });
                        }
                    }

                    if (offer.ORDERED_OFFER_DISCOUNTS && offer.ORDERED_OFFER_DISCOUNTS.length > 0) {
                        offer.ORDERED_OFFER_DISCOUNTS.forEach(discount => {
                            items.push({
                                isOfferDiscount: true,
                                name: discount.DISCOUNT_NAME ? discount.DISCOUNT_NAME : this.$translate.getText('MANUAL_ITEM_DISCOUNT'),
                                qty: null,
                                amount: this.$utils.toFixedSafe(discount.DISCOUNT_AMOUNT * -1, 2)
                            })
                        })
                    }
                }
            });
        }

        return {
            items: items,
            oth: oth,
            isReturnOrder: isReturnOrder,
            isTaxExempt: isTaxExempt
        };

    }

    resolveTotals(variables, collections) {
        let totals = [];

        if (variables.TOTAL_SALES_AMOUNT !== undefined && ((collections.ORDER_DISCOUNTS_LIST && collections.ORDER_DISCOUNTS_LIST.length > 0) ||
            variables.TOTAL_TIPS !== undefined ||
            (this._isUS && collections.EXCLUSIVE_TAXES && collections.EXCLUSIVE_TAXES.length > 0))) {
            totals.push({
                name: this.$translate.getText('TOTAL_ORDER'),
                amount: this.$utils.toFixedSafe(variables.TOTAL_SALES_AMOUNT, 2)
            })
        }

        if (collections.ORDER_DISCOUNTS_LIST && collections.ORDER_DISCOUNTS_LIST.length > 0) {
            collections.ORDER_DISCOUNTS_LIST.forEach(discount => {
                totals.push({
                    name: discount.DISCOUNT_NAME ? discount.DISCOUNT_NAME : this.$translate.getText('ORDER_DISCOUNT'),
                    amount: this.$utils.toFixedSafe(discount.DISCOUNT_AMOUNT * -1, 2)
                })
            })
        }
        if (collections.EXCLUSIVE_TAXES && collections.EXCLUSIVE_TAXES.length > 0 && this._isUS) {
            collections.EXCLUSIVE_TAXES.forEach(tax => {
                totals.push({
                    type: 'exclusive_tax',
                    name: tax.NAME ? tax.NAME : this.$translate.getText('ECVLUSIVE_TAX'),
                    amount: this.$utils.toFixedSafe(tax.AMOUNT, 2),
                    rate: this.$utils.toFixedSafe(tax.RATE, 2)
                })
            })
        }

        if (collections.TIPS) {

            let autoGratuityTips = collections.TIPS.filter(c => c.SCOPE === "order");
            if (autoGratuityTips && autoGratuityTips.length > 0) {

                //Service charge
                if (autoGratuityTips && autoGratuityTips.length > 0 && this._isUS) {
                    autoGratuityTips.forEach(tip => {

                        let _name = tip.NAME ? tip.NAME : this.$translate.getText('SERVICE_CHARGE')
                        let _percent = tip.PERCENT;
                        if (_percent !== undefined) {
                            _name = tip.NAME ? `${tip.NAME} ${_percent}%` : `${this.$translate.getText('SERVICE_CHARGE')} ${_percent}%`;
                        }

                        if (tip.AMOUNT !== 0) {
                            totals.push({
                                type: 'service_charge',
                                name: _name,
                                amount: this.$utils.toFixedSafe(tip.AMOUNT, 2)
                            })

                        }

                    })
                }
            }

        }

        if (variables.TOTAL_TIPS_ON_PAYMENTS !== undefined || variables.TOTAL_TIPS !== undefined) {

            let tipAmount = 0;
            if (variables.TOTAL_TIPS_ON_PAYMENTS !== undefined && variables.TOTAL_TIPS_ON_PAYMENTS !== 0) { tipAmount = variables.TOTAL_TIPS_ON_PAYMENTS; }
            else if (variables.TOTAL_TIPS !== undefined && variables.TOTAL_TIPS !== 0) { tipAmount = variables.TOTAL_TIPS; }

            if (tipAmount > 0) {
                totals.push({
                    type: 'tips',
                    name: this.$translate.getText('TIP'),
                    amount: this.$utils.toFixedSafe(tipAmount, 2)
                })
            }
            //if it is a returned order, the tip is negative and needs to be presented
            if (collections.PAYMENT_LIST[0].TRANS_TYPE === this.Enums().TransTypes.Return) {
                if (collections.PAYMENT_LIST[0].TIP_AMOUNT !== 0) {
                    totals.push({
                        type: 'tips',
                        name: this.$translate.getText('TIP'),
                        amount: this.$utils.toFixedSafe(-1 * collections.PAYMENT_LIST[0].TIP_AMOUNT, 2)
                    })
                }
            }
        }

        if (!this._isUS) {
            totals.push({
                name: this.$translate.getText('TOTAL_INC_VAT'),
                amount: this.$utils.toFixedSafe(variables.TOTAL_IN_VAT || 0, 2)
            })
        }

        if (this._isUS) {
            totals.push({
                name: this.$translate.getText('TOTAL_INC_VAT'),
                amount: this.$utils.toFixedSafe(variables.TOTAL_AMOUNT || 0, 2)
            })
        }

        return totals;
    }

    resolvePayments(variables, collections) {

        // filter payments by ommitted property removes cancelled and refund payments once the order goes shva offline

        let filteredPyaments = this.filterOmittedPayments(collections.PAYMENT_LIST);

        let payments = [];

        filteredPyaments.forEach(payment => {
            payments.push({
                name: this.resolvePaymentName(payment),
                amount: payment.PAYMENT_TYPE ? this.$utils.toFixedSafe(payment.P_AMOUNT * -1, 2) : this.$utils.toFixedSafe(payment.P_AMOUNT, 2),
                holderName: payment.CUSTOMER_NAME !== undefined ? payment.CUSTOMER_NAME : ''
            });
        });

        payments.push({
            type: 'change',
            name: this.$translate.getText('CHANGE'),
            amount: variables.CHANGE
        });

        return payments;
    }

    resolveTaxes(variables, collections) {

        let taxes = {
            InclusiveTaxes: [],
            ExemptedTaxes: [],
            ExemptedTaxData: []
        };

        if (collections.INCLUSIVE_TAXES && collections.INCLUSIVE_TAXES.length > 0 && this._isUS) {

            taxes.InclusiveTaxes.push({
                type: 'title',
                name: `${this.$translate.getText('INCLUSIVE_TAXES')}:`,
                amount: undefined
            })

            collections.INCLUSIVE_TAXES.forEach(tax => {
                taxes.InclusiveTaxes.push({
                    type: 'inclusive_tax',
                    name: tax.NAME ? tax.NAME : this.$translate.getText('INCLUSIVE_TAXES'),
                    amount: this.$utils.toFixedSafe(tax.AMOUNT, 2),
                    rate: this.$utils.toFixedSafe(tax.RATE, 2)
                })
            })
        }

        if (collections.EXEMPTED_TAXES && collections.EXEMPTED_TAXES.length > 0 && this._isUS) {

            taxes.ExemptedTaxes.push({
                type: 'title',
                name: `${this.$translate.getText('EXEMPTED_TAXES')}:`,
                amount: undefined
            })

            collections.EXEMPTED_TAXES.forEach(tax => {
                taxes.ExemptedTaxes.push({
                    type: 'exempted_tax',
                    name: tax.NAME ? tax.NAME : this.$translate.getText('EXEMPTED_TAX'),
                    amount: this.$utils.toFixedSafe(tax.AMOUNT, 2),
                    rate: this.$utils.toFixedSafe(tax.RATE, 2)
                })
            });
        }

        return taxes;

    }

    resolvePaymentName(payment) {
        let refund = '';
        let paymentName = '';

        if (payment.PAYMENT_TYPE === 'REFUND') {

            if (payment.TRANS_TYPE === this.Enums().TransTypes.Reversal) {
                refund = this.$translate.getText('REVERSAL');
            }
            else if (payment.TRANS_TYPE === this.Enums().TransTypes.Return) {
                refund = this.$translate.getText('RETURN');
            }
            else {
                refund = this.$translate.getText('REFUND');
            }

        }

        if (payment.P_TENDER_TYPE === 'creditCard' || payment.P_TENDER_TYPE === 'gidtCard') {
            paymentName = refund !== '' ? `${refund} (${payment.CARD_TYPE} ${payment.LAST_4})` : `${payment.CARD_TYPE} ${payment.LAST_4}`;
        } else {
            paymentName = `${payment.P_NAME} ${refund}`;
        }

        return paymentName;

    }

    resolvePrintByOrder(variables) {

        return this.$translate.getText('PRINT_BY_ORDER',
            ["order_number", "order_date", "order_time"],
            [variables.ORDER_NO, moment(variables.CREATED_AT).format('DD/MM/YYYY'), moment(variables.CREATED_AT).format('HH:mm:ss')]
        );
    }

    resolveWaiterDiners(variables) {

        let DISPLAY_NAME = "";
        if (variables.F_NAME !== undefined) {
            DISPLAY_NAME += variables.F_NAME;
        }

        if (variables.L_NAME !== undefined) {
            DISPLAY_NAME += ` ${variables.L_NAME[0]}`;
        }

        let TABLE_NO = "";
        if (variables.TABLE_NO !== undefined) {
            TABLE_NO = variables.TABLE_NO;
        }

        let RESULT_TEXT = "";

        let _TEXT_WAITER_N_DINERS = this.$translate.getText('WAITER_DINERS',
            ["waiter", "diners"],
            [`${DISPLAY_NAME}`, variables.NUMBER_OF_GUESTS]
        );

        RESULT_TEXT += _TEXT_WAITER_N_DINERS;

        // if (TABLE_NO !== "") {
        //     let _TEXT_TABLE = $translate.getText('TABLE_NUM',
        //         ["table"],
        //         [TABLE_NO]
        //     );

        //     RESULT_TEXT += ` ${_TEXT_TABLE}`;
        // }

        return RESULT_TEXT;

    }
    filterOmittedPayments(payments) {

        let omittedOrders = [];

        let filteredItems = payments.forEach(p => {
            if (p.PROVIDER_TRANS_STATUS === 'omitted') {
                if (p.CANCELED) {

                    let findRefundPayment = payments.find(r => {
                        return !r.CANCELED && r.PAYMENT_TYPE === "REFUND" && r.P_AMOUNT === p.P_AMOUNT && r.PROVIDER_TRANS_STATUS === 'omitted';
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
                    return p.P_ID === i.P_ID;
                })
                if (findPayment !== -1) {
                    payments.splice(findPayment, 1)
                }
            })
        }

        return payments;

    }

    resolveChecksData(printCheck) {

        let CheckBill = function (collections, variables, data, printByOrder, waiterDiners) {
            this.collections = printCheck.printData.collections;
            this.variables = printCheck.printData.variables;
            this.data = data;
            this.print_by_order = printByOrder;
            this.waiter_diners = waiterDiners;
        }

        let collections = printCheck.printData.collections;
        let variables = printCheck.printData.variables;

        if (collections.PAYMENT_LIST.length === 0) {
            return;
        }

        let data = {};

        let _details = this.resolveItems(variables, collections);

        data.items = _details.items;
        data.oth = _details.oth;
        data.isReturnOrder = _details.isReturnOrder;
        data.isTaxExempt = _details.isTaxExempt;

        let _totals = this.resolveTotals(variables, collections, true)
        data.totals = _totals;

        let _payments = this.resolvePayments(variables, collections, true);
        data.payments = _payments;

        let _taxes = this.resolveTaxes(variables, collections, true);
        data.taxes = _taxes;

        let printByOrder = this.resolvePrintByOrder(variables);
        let waiterDiners = this.resolveWaiterDiners(variables);

        let checkBill = new CheckBill(collections, variables, data, printByOrder, waiterDiners);
        return checkBill;
    }







    resolvePrintData(printData, isUS) {


        let DataBill = function (collections, variables, data, printByOrder, waiterDiners) {
            this.collections = printData.collections;
            this.variables = printData.variables;
            this.data = data;
            this.print_by_order = printByOrder;
            this.waiter_diners = waiterDiners;
        }

        let collections = printData.collections;
        let variables = printData.variables;

        let data = {};

        let _details = this.resolveItems(variables, collections);

        data.items = _details.items;
        data.oth = _details.oth;
        data.isReturnOrder = _details.isReturnOrder;
        data.isTaxExempt = _details.isTaxExempt;

        let _totals = this.resolveTotals(variables, collections, true)
        data.totals = _totals;
        let _payments = this.resolvePayments(variables, collections, true);
        data.payments = _payments;

        let _taxes = this.resolveTaxes(variables, collections, true);
        data.taxes = _taxes;

        data.isUS = isUS;

        let printByOrder = this.resolvePrintByOrder(variables);
        let waiterDiners = this.resolveWaiterDiners(variables);

        return new DataBill(collections, variables, data, printByOrder, waiterDiners);
    }
}