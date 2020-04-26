window.DocumentViewer.PaymentsService = (function () {

    let translateService;
    let userService;
    let utils;

    const Enums = {
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
        Sources: {
            TabitPay: "tabitPay"
        }
    }

    function PaymentsService(options) {

        utils = new window.DocumentViewer.Utils();

        translateService = new window.DocumentViewer.EnrichOrderTranslateService({
            local: options.local
        });

        userService = new window.DocumentViewer.UserService();

    }

    function resolvePayments(order) {

    }

    function resolvePaymentData(payment) {

        let data = [];

        function buildPaymentRow(payment) {

            let result = [];
            let _paymentDetailsText = "";

            let arr = [];

            // 1. Payment Method Name.
            let paymentMethodName = resolvePaymentMethodName({
                key: payment._type,
                addSpace: true,
                addChar: ":"
            });

            if (paymentMethodName !== "") {
                arr.push(paymentMethodName);
                _paymentDetailsText += paymentMethodName;
            }

            // 2. Payment : Credit Card Brand / Account Name
            if (payment._type === Enums.PaymentTypes.CreditCardPayment || payment._type === Enums.PaymentTypes.CreditCardRefund) {
                if (payment.creditCardBrand && payment.creditCardBrand !== "") {
                    let value = payment.creditCardBrand;
                    arr.push(value);
                    _paymentDetailsText += `  ${value}`;
                }

            }
            else if (payment._type === Enums.PaymentTypes.ChargeAccountPayment || payment._type === Enums.PaymentTypes.ChargeAccountRefund) {
                if (payment.accountName && payment.accountName !== "") {
                    arr.push(payment.accountName);
                    _paymentDetailsText += payment.accountName;
                }
            }

            // 3. Last 4 Number.
            if (payment.last4 && payment.last4 !== "" && payment.last4 !== "xxxx") {
                arr.push(payment.last4);
                _paymentDetailsText += `  ${payment.last4}`;
            }

            // Add array texts of 1, 2 & 3.
            if (arr.length > 0) {
                let _text = "";
                arr.forEach(c => _text += "  " + c);
                result.push({ value: _text });
            }

            // 4. Amount.
            let amount = utils.toFixedSafe(utils.currencyFraction(payment.amount), 2);
            result.push({ key: translateService.getText('AMOUNT'), value: amount });

            // 5. Customer Holder Name.
            let holderName = "";
            if (payment.customerDetails) {
                if (payment.customerDetails.name && payment.customerDetails.name !== "") {
                    result.push({ key: translateService.getText('CUSTOMER_NAME'), value: payment.customerDetails.name });
                }
            }

            // 6. Source TabitPay.
            if (payment._type === Enums.PaymentTypes.CreditCardPayment || payment._type === Enums.PaymentTypes.CreditCardRefund) {

                if (payment.source === Enums.Sources.TabitPay) {
                    let value = "(Tabit Pay)";
                    result.push({ key: 'source', value: value });
                }
            }

            return result;
        }

        let paymentDetails = buildPaymentRow(payment);
        paymentDetails.forEach(c => data.push(c));
        return data;

    }

    function resolvePaymentMethodName(options) {

        let key = options.key;
        let addSpace = options.addSpace;
        let addChar = options.addChar;

        let paymentsHash = {
            oth: translateService.getText('OTH'),
            ChargeAccountPayment: translateService.getText('CHARGE_ACCOUNT'),
            CashPayment: translateService.getText('CASH'),
            GiftCard: translateService.getText('GIFT_CARD'),
            GiftCardLoad: translateService.getText('GIFT_CARD_LOAD'),
            ChequePayment: translateService.getText('CHEQUE'),
            CreditCardPayment: translateService.getText('CREDIT'),
            ChargeAccountRefund: translateService.getText('CHARGE_ACCOUNT_REFUND'),
            CashRefund: translateService.getText('CASH_REFUND'),
            ChequeRefund: translateService.getText('CHEQUE_REFUND'),
            CreditCardRefund: translateService.getText('CREDIT_REFUND'),
        }

        let result = "";
        if (key === "CreditCardPayment") {
            result = "";
        }
        else {
            result = paymentsHash[key];
            if (addChar === undefined) { addChar = "-" }
            if (addSpace) { result += " " + addChar + " "; }
        }

        return result;
    }

    function resolvePaymentNames(order) {

        function addIfNotExists(list, item) {
            if (list.indexOf(item) === -1) {
                list.push(item);
            }
        }

        let result = [];
        let payments = order.payments;

        if (payments) {

            if (order.onTheHouse) {
                result.push(Enums.PaymentTypes.OTH);
            } else {

                payments.forEach(payment => {

                    switch (payment._type) {
                        case Enums.PaymentTypes.ChargeAccountPayment:
                            addIfNotExists(result, Enums.PaymentTypes.ChargeAccountPayment);
                            break;
                        case Enums.PaymentTypes.CashPayment:
                            addIfNotExists(result, Enums.PaymentTypes.CashPayment);
                            break;
                        case Enums.PaymentTypes.ChequePayment:
                            addIfNotExists(result, Enums.PaymentTypes.ChequePayment);
                            break;
                        case Enums.PaymentTypes.CreditCardPayment:
                            addIfNotExists(result, Enums.PaymentTypes.CreditCardPayment);
                            break;
                        case Enums.PaymentTypes.CashRefund:
                            addIfNotExists(result, Enums.PaymentTypes.CashRefund);
                            break;
                        case Enums.PaymentTypes.ChequeRefund:
                            addIfNotExists(result, Enums.PaymentTypes.ChequeRefund);
                            break;
                        case Enums.PaymentTypes.CreditCardRefund:
                            addIfNotExists(result, Enums.PaymentTypes.CreditCardRefund);
                            break;

                        default:
                            break;
                    }

                });

            }
        }

        return result.join('+');
    }

    function resolvePaymentsAmount(order) {

        let payments = order.payments;

        payments.forEach(payment => {

            payment.name = payment._type;

            if (payment.customerDetails !== undefined) {
                payment.holderName = payment.customerDetails.name !== undefined ? payment.customerDetails.name : ''
            }

            if (payment._type === Enums.PaymentTypes.CreditCardRefund ||
                payment._type === Enums.PaymentTypes.ChargeAccountRefund ||
                payment._type === Enums.PaymentTypes.CashRefund ||
                payment._type === Enums.PaymentTypes.ChequeRefund ||
                payment._type === Enums.PaymentTypes.CreditCardRefund) {
                payment.amount *= -1;
            }

            payment.methodName = resolvePaymentMethodName({
                key: payment._type,
                addSpace: false
            });

            payment.methodName += " ";

            if (payment._type === Enums.PaymentTypes.ChargeAccountPayment) {
                payment.methodName += payment.accountName;
            }

            if (payment._type === Enums.PaymentTypes.ChequeRefund) {
                payment.accountName = "cheque_refund"
            }
        });

        return payments;
    }

    PaymentsService.prototype.resolvePayments = resolvePayments;
    PaymentsService.prototype.resolvePaymentData = resolvePaymentData;
    PaymentsService.prototype.resolvePaymentNames = resolvePaymentNames;
    PaymentsService.prototype.resolvePaymentsAmount = resolvePaymentsAmount;

    return PaymentsService;

})();
