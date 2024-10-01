import Utils from '../helpers/utils.service';
import TlogDocsTranslateService from './tlogDocsTranslate';
import Localization from "../helpers/localization.service";
import moment from 'moment';
import _ from "lodash";

export default class BillService {
    constructor(options) {
        this.realRegion = options.realRegion || 'il';
        this.$utils = new Utils();
        this.$translate = new TlogDocsTranslateService(options);
        this.$localization = new Localization(options);
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
                Single: "Single",
                Combo: 'Combo',
                ComplexOne: 'Complex-One',
                ComplexMulti: 'Complex-Multi'
            },
            TransTypes: {
                Reversal: "Reversal",
                Return: "Return",
                Refund: "Refund",
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
        if ((collections.EXEMPTED_TAXES && collections.EXEMPTED_TAXES.length > 0 && this.$localization.allowByRegions(['us', 'au']))) {
            isTaxExempt = true;
        }

        let items = [];
        let oth = [];
        let pointsRedeem = [];
        if(collections.POINTS_REDEMPTION && collections.POINTS_REDEMPTION.length > 0){
            pointsRedeem = collections.POINTS_REDEMPTION
        }

        if (offersList && offersList.length > 0) {
            offersList.forEach(offer => {

                let isSplitCheck = false;
                let isWeight = false;

                if (offer.OFFER_UNITS !== undefined && offer.OFFER_UNITS !== null && offer.OFFER_UNITS > 0) {
                    isWeight = true;
                }

                let offerQty = 0;
                if (offer.SPLIT_DENOMINATOR && offer.SPLIT_NUMERATOR && offer.SPLIT_DENOMINATOR !== 100 && offer.SPLIT_NUMERATOR !== 100) {
                    offerQty = `${offer.SPLIT_NUMERATOR}/${offer.SPLIT_DENOMINATOR}`;
                    isSplitCheck = true;
                } else {
                    offerQty = offer.OFFER_QTY;
                }

                if (offer.OFFER_TYPE === this.Enums().OfferTypes.Simple) {

                    let item = {
                        isOffer: true,
                        name: offer.OFFER_NAME,
                        qty: offerQty
                    };

                    if (offer.ON_THE_HOUSE) {
                        item.isOTH = true;
                    }

                    if (isReturnOrder) {
                            item.amount = this.$utils.toFixedSafe(offer.OFFER_AMOUNT, 2);
                            items.push(item);
                    } else if (isWeight) {
                            item.amount = this.$utils.toFixedSafe(offer.OFFER_AMOUNT, 2);
                            item.isWeight = isWeight;
                            item.weightAmount = this.$utils.toFixedSafe(offer.OFFER_CALC_AMT, 2);
                            item.units = offer.OFFER_UNITS;
                            items.push(item);
                    }
                    else if (offer.OFFER_CALC_AMT !== null && isSplitCheck === false && !offer.OPEN_PRICE) { // if the offer amount is 0 not need to show

                            if (!(offer.OFFER_CALC_AMT === 0 && offer.OFFER_AMOUNT === 0)) {
                                item.amount = this.$utils.toFixedSafe(offer.OFFER_CALC_AMT, 2);
                                items.push(item);
                            }

                    } else if (isSplitCheck === true) {
                            item.amount = this.$utils.toFixedSafe(offer.OFFER_AMOUNT, 2)
                            items.push(item);
                    }
                    else if (offer.OPEN_PRICE) {
                            item.amount = this.$utils.toFixedSafe(offer.OFFER_AMOUNT, 2)
                            items.push(item);
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

                if ([this.Enums().OfferTypes.ComplexOne, this.Enums().OfferTypes.Combo,
                    this.Enums().OfferTypes.ComplexMulti,
                    this.Enums().OfferTypes.Single].indexOf(offer.OFFER_TYPE) > -1) {


                    let item = {
                        isOffer: true,
                        name: offer.OFFER_NAME,
                        qty: offerQty
                    }

                    if (offer.ON_THE_HOUSE) {
                        item.isOTH = true;
                    }

                    if (isReturnOrder) {
                            item.amount = this.$utils.toFixedSafe(isReturnOrder ? offer.OFFER_AMOUNT : offer.OFFER_AMOUNT, 2);
                            items.push(item);
                    } else if (offer.OFFER_CALC_AMT !== null && isSplitCheck === false) { // if the offer amount is 0 not need to show
                        if (!(offer.OFFER_CALC_AMT === 0 && offer.OFFER_AMOUNT === 0)) {
                                item.amount = this.$utils.toFixedSafe(offer.OFFER_CALC_AMT, 2);
                                items.push(item);
                        }

                    } else if (isSplitCheck === true) {
                            item.amount = this.$utils.toFixedSafe(offer.OFFER_AMOUNT, 2);
                            items.push(item);
                    }

                    if (offer.OPEN_PRICE) {
                            item.amount = this.$utils.toFixedSafe(offer.OFFER_AMOUNT, 2);
                            items.push(item);
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
                                            amount: item.ON_THE_HOUSE ? this.$translate.getText('OTH') : this.$utils.toFixedSafe(modifier.MODIFIER_PRICE, 2)
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
            pointsRedeem: pointsRedeem,
            oth: oth,
            isReturnOrder: isReturnOrder,
            isTaxExempt: isTaxExempt
        };

    }

    resolveTotals(variables, collections) {
        console.log('variables: ', variables)
        console.log('collections: ', collections)
        let totals = [];
        const subtotalDiffersFromTotal = variables.TOTAL_AMOUNT !== variables.INCLUSIVE_NET_AMOUNT;
     
        if(this.$localization.allowByRegions(['us', 'au'])) {
            let INCLUSIVE_GROSS_AMOUNT = _.get(variables, 'INCLUSIVE_GROSS_AMOUNT', variables.TOTAL_SALES_AMOUNT);
            let totalSales = _.get(variables, 'INCLUSIVE_NET_AMOUNT', variables.TOTAL_SALES_AMOUNT);
            if(INCLUSIVE_GROSS_AMOUNT !== totalSales) {
                totals.push({
                    name: this.$translate.getText('INCLUSIVE_GROSS_AMOUNT'),
                    amount: this.$utils.toFixedSafe(INCLUSIVE_GROSS_AMOUNT, 2)
                });
            }

            const discounts = _.get(collections, 'ORDER_DISCOUNTS_LIST', []);
            discounts.forEach(item => {
                totals.push({
                    name: item.DISCOUNT_NAME || this.$translate.getText('ORDER_DISCOUNT_US'),
                    amount: this.$utils.toFixedSafe(item.DISCOUNT_AMOUNT * -1, 2)
                })
            })
        }

        if (variables.TOTAL_SALES_AMOUNT !== undefined && ((collections.ORDER_DISCOUNTS_LIST && collections.ORDER_DISCOUNTS_LIST.length > 0) ||
            variables.TOTAL_TIPS !== undefined || (this.$localization.allowByRegions(['au']) && subtotalDiffersFromTotal)
            || (this.$localization.allowByRegions(['us']) && collections.EXCLUSIVE_TAXES && collections.EXCLUSIVE_TAXES.length > 0))
            || (this.$localization.allowByRegions(['us']) && _.get(collections, 'RETURNED_FEES', []).length) ||
            (this.$localization.allowByRegions(['us']) && collections.EXEMPTED_TAXES && collections.EXEMPTED_TAXES.length > 0 ) && _.get(variables,'TOTAL_FEES', null)) {


            const orderType = _.get(variables, 'ORDER_TYPE', '');
            if (orderType.toUpperCase() !== 'MEDIAEXCHANGE') {
                /**
                 * SUBTOTAL (TOTAL_ORDER) :
                 *  in US is 'TOTAL_BEFORE_EXCLUDED_TAX_BEFORE_DISCOUNTS'.
                 *  in IL is 'TOTAL_SALES_AMOUNT'.
                 *  Backward compatibility - default is 'TOTAL_SALES_AMOUNT'
                 */
                let TOTAL_SALES = 0;
                if (this.$localization.allowByRegions(['us', 'au'])) {
                    TOTAL_SALES = _.get(variables, 'INCLUSIVE_NET_AMOUNT', variables.TOTAL_SALES_AMOUNT);

                } else {
                    TOTAL_SALES = variables.TOTAL_SALES_AMOUNT;
                }

                totals.push({
                    name: this.$translate.getText('TOTAL_ORDER'),
                    amount: this.$utils.toFixedSafe(TOTAL_SALES, 2)
                });
            }
        }

        if (this.$localization.allowByRegions(['il'])) {
            if (collections.ORDER_DISCOUNTS_LIST && collections.ORDER_DISCOUNTS_LIST.length > 0) {
                collections.ORDER_DISCOUNTS_LIST.forEach(discount => {
                    totals.push({
                        name: discount.DISCOUNT_NAME ? discount.DISCOUNT_NAME : this.$translate.getText('ORDER_DISCOUNT'),
                        amount: this.$utils.toFixedSafe(discount.DISCOUNT_AMOUNT * -1, 2)
                    })
                })
            }
        }

        if (this.$localization.allowByRegions(['us']) && _.get(variables,'TOTAL_FEES', null)) {
            totals.push({
                name: this.$translate.getText('FEE'),
                amount: this.$utils.toFixedSafe(variables.TOTAL_FEES , 2)
            })
        }

        if (this.$localization.allowByRegions(['au'])) {
            const fees = _.get(collections, 'FEES', []);
            fees.forEach(fee => {
                    totals.push({
                        name: fee.NAME,
                        amount: this.$utils.toFixedSafe(fee.AMOUNT, 2)
                    });
            });
        }

        if (collections.EXCLUSIVE_TAXES && collections.EXCLUSIVE_TAXES.length > 0 && this.$localization.allowByRegions(['us', 'au'])) {
            collections.EXCLUSIVE_TAXES.forEach(tax => {
                if (tax.AMOUNT) {
                    totals.push({
                        type: 'exclusive_tax',
                        name: tax.NAME ? tax.NAME : this.$translate.getText('ECVLUSIVE_TAX'),
                        amount: this.$utils.toFixedSafe(tax.AMOUNT, 2),
                        rate: this.$utils.toFixedSafe(tax.RATE, 3)
                    })
                }
            })
        }

        let isServiceCharge = false;

        if (collections.TIPS) {

            let autoGratuityTips = collections.TIPS.filter(c => c.SCOPE === "order");
            if (autoGratuityTips && autoGratuityTips.length > 0) {

                //Service charge
                if (autoGratuityTips && autoGratuityTips.length > 0 && this.$localization.allowByRegions(['us', 'au'])) {
                    autoGratuityTips.forEach(tip => {

                        let _name = tip.NAME ? tip.NAME : this.$translate.getText('SERVICE_CHARGE')
                        let _percent = tip.PERCENT;
                        if (_percent !== undefined) {
                            _name = tip.NAME ? `${tip.NAME} ${_percent}%` : `${this.$translate.getText('SERVICE_CHARGE')} ${_percent}%`;
                        }

                        if (tip.AMOUNT !== 0) {
                            isServiceCharge = true;
                            totals.push({
                                type: 'service_charge',
                                name: _name,
                                amount: this.$utils.toFixedSafe(tip.AMOUNT, 2)
                            });
                        }

                    });
                }
            }

        }

        if (variables.TOTAL_TIPS_ON_PAYMENTS !== undefined && variables.TOTAL_TIPS_ON_PAYMENTS > 0 && isServiceCharge == true) {

            totals.push({
                type: 'tips',
                name: this.$translate.getText('TIP'),
                amount: this.$utils.toFixedSafe(variables.TOTAL_TIPS_ON_PAYMENTS, 2)
            });
        } else if (variables.TOTAL_TIPS_ON_PAYMENTS !== undefined || variables.TOTAL_TIPS !== undefined) {

            let tipAmount = 0;
            if (variables.TOTAL_TIPS_ON_PAYMENTS !== undefined && variables.TOTAL_TIPS_ON_PAYMENTS !== 0) {
                tipAmount = variables.TOTAL_TIPS_ON_PAYMENTS;
            } else if (variables.TOTAL_TIPS !== undefined && variables.TOTAL_TIPS !== 0) {
                tipAmount = variables.TOTAL_TIPS;
            }

            if (tipAmount > 0 || this.$localization.allowByRegions(['il'])) {

                if (isServiceCharge === false) {
                    totals.push({
                        type: 'tips',
                        name: this.$translate.getText('TIP'),
                        amount: this.$utils.toFixedSafe(tipAmount, 2)
                    });
                }
            }

            //if it is a returned order, the tip is negative and needs to be presented
            const TRANS_TYPE = _.get(collections, 'PAYMENT_LIST[0].TRANS_TYPE');
            if ([this.Enums().TransTypes.Return, this.Enums().TransTypes.Refund].includes(TRANS_TYPE)) {
                if (collections.PAYMENT_LIST[0].TIP_AMOUNT !== 0) {
                    totals.push({
                        type: 'tips',
                        name: this.$translate.getText('TIP'),
                        amount: this.$utils.toFixedSafe(-1 * collections.PAYMENT_LIST[0].TIP_AMOUNT, 2)
                    })
                }
            }
        }

        if (this.$localization.allowByRegions(['il'])) {
            totals.push({
                name: this.$translate.getText('TOTAL_INC_VAT'),
                amount: this.$utils.toFixedSafe(_.get(variables,'TOTAL_BEFORE_TAX',variables.TOTAL_IN_VAT) || 0, 2)
            })
        }

        if (this.$localization.allowByRegions(['us', 'au'])) {
            totals.push({
                name: this.$translate.getText('TOTAL_INC_VAT'),
                amount: this.$utils.toFixedSafe(variables.TOTAL_AMOUNT || 0, 2)
            })
        }

        if(this.$localization.allowByRegions(['us'])) {
            if(variables.TOTAL_AMOUNT_AFTER_CASH_BONUS) {
                totals.push({
                    name: this.$translate.getText('TOTAL_AMOUNT_AFTER_CASH_BONUS'),
                    amount: this.$utils.toFixedSafe(variables.TOTAL_AMOUNT_AFTER_CASH_BONUS, 2)
                });
                totals.push({
                    name: this.$translate.getText('MAX_CASH_DISCOUNT'),
                    amount: this.$utils.toFixedSafe(variables.MAX_CASH_DISCOUNT * -1, 2)
                });
            }
        }
        

        return totals;
    }

    resolvePayments(variables, collections) {
        let payments = [];
        const isDualPricingStrategy = !!(variables.CARD_BAL_DUE && variables.CASH_BAL_DUE);

        if (isDualPricingStrategy && this.$localization.allowByRegions(['us']) && variables.BAL_DUE) {

            if (variables.TOTAL_FOR_CARD) {
                payments.push({
                    name: this.$translate.getText('CARD_TOTAL'),
                    amount: this.$utils.toFixedSafe(variables.TOTAL_FOR_CARD || 0, 2)
                })
            }
            if (variables.TOTAL_FOR_CASH) {
                payments.push({
                    name: this.$translate.getText('CASH_TOTAL'),
                    classList: ['dual-pricing-cash', 'border-bottom'],
                    amount: this.$utils.toFixedSafe(variables.TOTAL_FOR_CASH || 0, 2)
                })
            }
        }

        // filter payments by ommitted property removes cancelled and refund payments once the order goes shva offline

        let filteredPayments = this.filterOmittedPayments(collections.PAYMENT_LIST);

        filteredPayments.forEach(payment => {
            let paymentData = Object.assign(payment, {
                name: this.resolvePaymentName(payment),
                amount: payment.PAYMENT_TYPE ? this.$utils.toFixedSafe(payment.P_AMOUNT * -1, 2) : this.$utils.toFixedSafe(payment.P_AMOUNT, 2),
                holderName: payment.CUSTOMER_NAME !== undefined ? payment.CUSTOMER_NAME : '',
                P_ID: payment.P_ID
            });
            if (payment.GUEST_NAME) paymentData.GUEST_NAME = payment.GUEST_NAME;
            if (payment.HOTEL_NAME) paymentData.HOTEL_NAME = payment.HOTEL_NAME;
            if (payment.ROOM_NUMBER) paymentData.ROOM_NUMBER = payment.ROOM_NUMBER;
            if (payment.HOTEL_CHECK_NUMBER) paymentData.HOTEL_CHECK_NUMBER = payment.HOTEL_CHECK_NUMBER;
            if (payment.P_BONUS_AMOUNT) paymentData.P_BONUS_AMOUNT = payment.P_BONUS_AMOUNT;
            if (payment.CASH_BAL_DUE) paymentData.CASH_BAL_DUE = payment.CASH_BAL_DUE ;
            if (payment.CURRENCY_AMOUNT) paymentData.CURRENCY_AMOUNT = payment.CURRENCY_AMOUNT;
            if (payment.CURRENCY_SYMBOL) paymentData.CURRENCY_SYMBOL = payment.CURRENCY_SYMBOL;
            if (payment.PROVIDER_TRANS_ID) paymentData.PROVIDER_TRANS_ID = payment.PROVIDER_TRANS_ID;
            if (payment.INSTALLMENTS_COUNT) paymentData.INSTALLMENTS_COUNT = payment.INSTALLMENTS_COUNT;
            if (payment.FIRST_INSTALLMENTS_AMOUNT) paymentData.FIRST_INSTALLMENTS_AMOUNT = payment.FIRST_INSTALLMENTS_AMOUNT;
            if (payment.REST_INSTALLMENTS_AMOUNT) paymentData.REST_INSTALLMENTS_AMOUNT = payment.REST_INSTALLMENTS_AMOUNT;

            payments.push(paymentData);
        });

        if(variables.TOTAL_ROUNDING){
            payments.push({
                type: 'paymentRounding',
                name: this.$translate.getText('ROUNDING'),
                amount: variables.TOTAL_ROUNDING
            });
        }

        if (variables.CHANGE) {
            payments.push({
                type: 'change',
                name: this.$translate.getText('CHANGE'),
                amount: variables.CHANGE
            });
        }

        // In case of orderBill (without variables.DOCUMENT_TYPE) and variables.BAL_DUE - Show it
        if (!variables.DOCUMENT_TYPE && variables.BAL_DUE) {

            if (this.$localization.allowByRegions(['us']) && isDualPricingStrategy) {
                if (variables.TOTAL_FOR_CARD !== variables.CARD_BAL_DUE) {
                    payments.push({
                        name: this.$translate.getText('CARD_BAL_DUE_FOR_DUAL_PRICING'),
                        amount: variables.CARD_BAL_DUE,
                        classList: ['border-top']
                    });
                }

                if (variables.TOTAL_FOR_CASH !== variables.CASH_BAL_DUE) {
                    payments.push({
                        name: this.$translate.getText('CASH_BAL_DUE_FOR_DUAL_PRICING'),
                        classList: ['dual-pricing-cash'],
                        amount: variables.CASH_BAL_DUE
                    });
                }
            } else {
                payments.push({
                    name: this.$translate.getText('Balance'),
                    amount: variables.BAL_DUE
                });
            }
        }

        return payments;
    }

    resolveTaxes(variables, collections) {

        let taxes = {
            InclusiveTaxes: [],
            ExemptedTaxes: [],
            ExemptedTaxData: []
        };

        if (collections.INCLUSIVE_TAXES && collections.INCLUSIVE_TAXES.length > 0 && this.$localization.allowByRegions(['us', 'au'])) {

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

        if (collections.EXEMPTED_TAXES && collections.EXEMPTED_TAXES.length > 0 && this.$localization.allowByRegions(['us', 'au'])) {

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

        if (payment.P_TENDER_TYPE === 'creditCard') {
            const card = this.$localization.allowByRegions(['au']) ?  payment.ISSUER : payment.CARD_TYPE;

            if (card && payment.LAST_4) {
                paymentName = refund !== '' ? `${refund} (${card} ${payment.LAST_4})` : `${card} ${payment.LAST_4}`;
            } else {
                paymentName = payment.P_NAME;
            }

        } else {
            if (this.$localization.allowByRegions(['us', 'au'])) {
                paymentName = `${payment.P_NAME} ${refund}`;
            } else {
                paymentName = `${refund} ${payment.P_NAME}`;
            }
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

            const OrderedItemsList = _.get(o,'ORDERED_ITEMS_LIST',[]);
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

            if(item.isOffer) {
                // Return items Header
                const returnItemsHeader = this._doc.createElement('div');
                returnItemsHeader.id = "returnItemsHeader";
                returnItemsHeader.innerHTML = this.$translate.getText('ReturnedItem');
                returnItemsHeader.style.margin = index === 0 ? "0px 0 5px 0" : "10px 0 5px 0" ;
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

    resolvePrintData(printData, realRegion) {
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

        data.totals = this.resolveTotals(variables, collections, true);
        data.payments = this.resolvePayments(variables, collections, true);

        data.taxes = this.resolveTaxes(variables, collections, true);
        data.realRegion = realRegion;

        let printByOrder = this.resolvePrintByOrder(variables);
        let waiterDiners = this.resolveWaiterDiners(variables);

        return new DataBill(collections, variables, data, printByOrder, waiterDiners);
    }

}
