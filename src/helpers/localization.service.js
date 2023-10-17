export default class Localization {
    currencyByRegion = {
        us: 'USD',
        il: 'ILS',
        au: 'AUD'
    };

    constructor(options) {
        this.realRegion = options.realRegion || 'il';
        this.currency = this.currencyByRegion[this.realRegion];
    }

    getSymbol() {
        if (this.currency === 'ILS') {
            return '&#8362;';
        } else {
            return '&#36;';
        }
    }

    allowByRegions(regions) {
        console.log('zohar -- this.realRegion', this.realRegion);
        return regions.includes(this.realRegion);
    }
}
