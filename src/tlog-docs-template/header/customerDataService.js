import TlogDocsUtils from '../tlogDocsUtils';
import TlogDocsTranslateService from '../tlogDocsTranslate';

export default class CustomerDataService {
    constructor(options) {
        this._isUS = options.isUS;
        this.$translate = new TlogDocsTranslateService(options);
        this.$utils = new TlogDocsUtils();
    }


    getCustomerData(printData, doc) {
        this._doc = doc;
        let customerHeaderDiv = this._doc.createElement('div');
        customerHeaderDiv.id = 'customerHeaderDiv';
        let forText = this.$translate.getText("FOR");
        let BnOrSnText = this.$translate.getText("BN_OR_SN");
        let customerName = printData.collections.PAYMENT_LIST[0].CUSTOMER_NAME;
        let customerId = printData.collections.PAYMENT_LIST[0].CUSTOMER_ID;
        customerHeaderDiv.innerHTML = "<div>" + forText + ": " + customerName + "</div><div>" + BnOrSnText + ": " + customerId + "</div>";
        customerHeaderDiv.classList.add('align-text');
        customerHeaderDiv.classList.add('m-bottom-10');

        return customerHeaderDiv;
    }

}