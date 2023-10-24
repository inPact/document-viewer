import * as moment from 'moment';
import 'moment-timezone';

export default class Utils {

    constructor(options) {
        this.options = options;
        this.formatByRegion = {
            il: 'DD/MM/YYYY H:mm',
            us: 'MM/DD/YYYY h:mm A',
            au: 'DD/MM/YYYY h:mm A'
        }
    }

    toFixedSafe(value, num) {
        if (value) {
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

    twoDecimals(number) {

        let result = '';

        if (number) {
            result = Number(number).toFixed(2);
        }

        return result;
    }

    getDecimals(number, precision = 2) {

        let result = '';

        if (number) {
            result = Number(number).toFixed(precision);
        }

        return result;
    }

    notEmpty(field) {
        if (field !== undefined && field !== null) { return true; }
        return false
    }

    toDate(options) {
        let result = '[DATE]';
        let date = options.date;
        let format = options.format;

        if (!format) {
            format = this.formatByRegion[options.realRegion];
        }

        if (options.timezone) {

            result = moment(date).tz(`${options.timezone}`).format(format);
        } else {
            result = moment(date).format(format);
        }

        return result;
    }

    formatBusinessDate(date) {
        //Business Dates has no meaning for universal time, only the date matters.
        const formatWithoutTime = this.formatByRegion[ this.options.realRegion].split(' ')[0];
        return moment.utc(date).format(formatWithoutTime);
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
