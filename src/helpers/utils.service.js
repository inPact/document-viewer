import * as moment from 'moment';
import 'moment-timezone';

export default class Utils {

    constructor(options) {

    }

    toFixedSafe(value, num) {
        if (value && value !== undefined) {
            return Number(value).toFixed(num);
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
        var intAmount = Number(amount);
        return intAmount < 0 ? 'negative' : "";

    }

    isUsAmount(isUS) {
        if (isUS) {
            return 'ltrAmount';
        }
        return 'rtlAmount';
    }

    twoDecimals(number) {

        let result = '';

        if (number) {
            result = Number(number).toFixed(2);
        }

        return result;
    }

    notEmpty(field) {
        if (field !== undefined && field !== null) { return true; }
        return false
    }

    toDate(options) {
        let result = '[DATE]';

        let isUS = options.isUS;
        let date = options.date;
        
        if (isUS) {
            if (options.timezone) {
                result = moment(date).tz(`${options.timezone}`).format('MM/DD/YYYY h:mm A');
            } else {
                result = moment(date).format('MM/DD/YYYY h:mm A');
            }
        } else {
            if (options.timezone) {
                result = moment(date).tz(`${options.timezone}`).format('DD/MM/YYYY H:mm');
            } else {
                result = moment(date).format('DD/MM/YYYY H:mm');
            }
        }

        return result;

    }

    replaceAll(text, search, replacement) {
        return text.replace(new RegExp(search, 'g'), replacement);
    };

    generateGuid(options) {

        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        if (options && options.count) {

            let result = '';

            for (let index = 0; index < options.count; index++) {

                if (index > 1) {
                    result += '-';
                }

                result += s4() + s4();
            }

            return result;
        }
        else {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        }
    };

}