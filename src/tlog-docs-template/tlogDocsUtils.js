// 'use strict'
// let TlogDocsUtils = (function () {

export default class TlogDocsUtils {


    // TlogDocsUtils() {

    // }
    constructor() {

    }

    toFixedSafe(value, num) {
        if (value && value !== undefined) {
            return value.toFixed(num);
        }
        return "0.00";
    }

    currencyFraction(val, showZero) {
        if (showZero && (!val || isNaN(val))) val = 0;
        if (!isNaN(val)) {
            var num = val / 100;
            var fixnum = _this.toFixedSafe(num, 2);
            return parseFloat(fixnum);
        }

    }

    isNegative(amount) {
        var intAmount = parseInt(amount);
        return intAmount < 0 ? 'negative' : "";

    }

    isUsAmount(isUS) {
        if (isUS) {
            return 'ltrAmount';
        }
        return 'rtlAmount';
    }
    twoDecimals(number) {
        return Number(number).toFixed(2);
    }

    notEmpty(field) {
        if (field !== undefined && field !== null) { return true; }
        return false
    }

}
