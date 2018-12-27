export default class Localization {

    constructor(options) {
        this.currency = options.isUS ? 'USD' : 'ILS';
    }

    getSymbol() {

        if (this.currency === 'ILS') {
            return '&#8362;';
        } else {
            return '&#36;';
        }

    }



}