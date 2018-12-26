export default class Localization {

    constructor(options) {

        console.log("Localization");
        console.log(options);

        this.currency = options.region.toUpperCase() === 'US' ? 'USD' : 'ILS';
    }

    getSymbol() {

        if (this.currency === 'ILS') {
            return '&#8362;';
        } else {
            return '&#36;';
        }

    }



}