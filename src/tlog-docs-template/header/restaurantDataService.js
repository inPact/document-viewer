import TlogDocsUtils from '../tlogDocsUtils';
import TlogDocsTranslateService from '../tlogDocsTranslate';

export default class RestaurantDataService {
    constructor(options) {
        this._isUS = options.isUS;
        this.$translate = new TlogDocsTranslateService(options);
        this.$utils = new TlogDocsUtils();
    }

    getRestaurantData(doc, printData) {
        this._doc = doc;
        //setting header constants div for display
        var tplHeaderConstants = this._doc.createElement('div');
        tplHeaderConstants.id = "tplHeaderConstants"
        tplHeaderConstants.classList += ' rowPadding';
        // setting constants
        let headerKeys = [
            'ORGANIZATION_NAME',
            'ORGANIZATION_LEGAL_NAME',
            'ORGANIZATION_ADDR_STREET',
            'ORGANIZATION_ADDR_CITY',
            'ORGANIZATION_TEL'
        ];


        headerKeys.forEach(element => {
            var constantLine = this.placeHeaderData(printData, element)
            tplHeaderConstants.appendChild(constantLine)
        })


        return tplHeaderConstants;

    }

    //inner function for placing the constants on the template with data

    placeHeaderData(printData, element) {
        var tplHeaderLine = this._doc.createElement('div');
        tplHeaderLine.id = 'tplHeaderLine';
        if (printData.variables.hasOwnProperty(element)) {

            switch (element) {
                case 'ORGANIZATION_NAME': {
                    tplHeaderLine.innerHTML = printData.variables.ORGANIZATION_NAME;
                    tplHeaderLine.classList += ' big-chars';
                }
                    break;
                case 'ORGANIZATION_LEGAL_NAME': {
                    if (!this._isUS) {
                        var bnNumber = this.$translate.getText('BN_NUMBER');
                        var orgString = printData.variables.ORGANIZATION_LEGAL_NAME + "-" + bnNumber + " " + printData.variables.ORGANIZATION_BN_NUMBER;
                        tplHeaderLine.innerHTML = orgString;
                    }
                    else {
                        tplHeaderLine.innerHTML = printData.variables.ORGANIZATION_LEGAL_NAME
                    }
                }
                    break;
                case 'ORGANIZATION_ADDR_STREET': {
                    tplHeaderLine.innerHTML = printData.variables.ORGANIZATION_ADDR_STREET;
                }
                    break;
                case 'ORGANIZATION_ADDR_CITY': {
                    tplHeaderLine.innerHTML = printData.variables.ORGANIZATION_ADDR_CITY;
                }
                    break;
                case 'ORGANIZATION_TEL': {
                    var phoneTranslate = this.$translate.getText('PHONE');
                    var phoneString = phoneTranslate + " " + printData.variables.ORGANIZATION_TEL;
                    tplHeaderLine.innerHTML = phoneString;
                }
                    break;

            }
        }
        return tplHeaderLine;

    }
}