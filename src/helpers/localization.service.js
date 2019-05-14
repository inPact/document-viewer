export default class Localization {

    constructor(options) {
        this.currency = options.isUS ? 'USD' : 'ILS';
        this.isUS = options.isUS;
    }

    isUS() {
        return this.isUS;
    }

    getSymbol() {

        if (this.currency === 'ILS') {
            return '&#8362;';
        } else {
            return '&#36;';
        }

    }



}