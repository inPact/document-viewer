export default class Utils {

    constructor(options) {

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


    formatDateUS(stringDate) {

        let date = new Date(stringDate);

        let day = date.getDate();
        let month = (date.getMonth() + 1);
        let year = date.getFullYear();
        let hour = (date.getHours() > 12 ? (date.getHours() - 12) : date.getHours());
        let minute = (date.getMinutes() > 9) ? date.getMinutes() : "0" + date.getMinutes();
        let a = (date.getHours() > 12 ? "PM" : "AM");

        if (day < 10) {
            day = `0${day}`;
        }

        if (month < 10) {
            month = `0${month}`;
        }

        return `${month}/${day}/${year} ${hour}:${minute} ${a}`;
    }

    formatDateIL(stringDate) {

        let date = new Date(stringDate);

        let day = date.getDate();
        let month = (date.getMonth() + 1);
        let year = date.getFullYear();
        let hour = (date.getHours() > 9) ? date.getHours() : "0" + date.getHours();
        let minute = (date.getMinutes() > 9) ? date.getMinutes() : "0" + date.getMinutes();

        if (day < 10) {
            day = `0${day}`;
        }

        if (month < 10) {
            month = `0${month}`;
        }

        return `${day}/${month}/${year} ${hour}:${minute}`;
    }

    toDate(options) {

        let result = '[DATE]';

        let isUS = options.isUS;
        let date = options.date;

        if (isUS) {
            result = this.formatDateUS(date);
        } else {
            result = this.formatDateIL(date);
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