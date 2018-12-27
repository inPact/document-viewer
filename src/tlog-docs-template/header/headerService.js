import TlogDocsUtils from '../tlogDocsUtils';
import TlogDocsTranslateService from '../tlogDocsTranslate';
import CustomerDataService from './customerDataService';
import RestaurantDataService from './restaurantDataService';
import OrderInfoService from './orderInfoService';
import OrderDataService from './orderDataService';

export default class HeaderService {

    constructor(options) {
        this._isUS = options.isUS;
        this.$translate = new TlogDocsTranslateService(options);
        this.$utils = new TlogDocsUtils();
        this.$customerDataService = new CustomerDataService(options);
        this.$restaurantDataService = new RestaurantDataService(options);
        this.$orderDataService = new OrderDataService(options);
        this.$orderInfoService = new OrderInfoService(options);

    }

    createHeader(printData, doc, docObj, docData) {
        this._doc = doc;
        this._docObj = docObj;
        this._docData = docData;
        //creating a div to populate and return
        var headerDiv = this._doc.createElement('div');
        headerDiv.id = "headerDiv";

        let restaurantDataDiv = this.$restaurantDataService.getRestaurantData(printData, doc);
        restaurantDataDiv.id = 'restaurantDataDiv';

        let customerDataDiv;
        if (printData.collections.PAYMENT_LIST.length > 0 && printData.collections.PAYMENT_LIST[0].CUSTOMER_ID) {

            customerDataDiv = this.$customerDataService.getCustomerData(printData, doc);
            customerDataDiv.id = 'customerDataDiv';

        }

        let orderDataDiv = this.$orderDataService.getOrderData(printData, doc, docObj, docData)
        orderDataDiv.id = 'orderData';
        orderDataDiv.classList += ' rowPadding'

        let orderInfoText = this.$orderInfoService.getOrderInfoText(printData, doc, docObj, docData);
        orderInfoText.id = 'orderInfoText';

        var tplHeader = this._doc.createElement('div');
        tplHeader.id = 'tplHeader';
        tplHeader.setAttribute('style', "text-align:center;")
        tplHeader.classList += ' rowPadding'

        var orderHeader = this.createOrderHeader(printData);
        orderHeader.id = 'orderHeader';
        orderHeader.classList += ' rowPadding'

        tplHeader.appendChild(restaurantDataDiv);
        tplHeader.appendChild(customerDataDiv);
        tplHeader.appendChild(orderDataDiv);
        tplHeader.appendChild(orderInfoText);

        headerDiv.appendChild(tplHeader);
        //styling the header
        headerDiv.classList.add('header-div');
        headerDiv.classList.add('header-border');

        return headerDiv;
    }


    placeOrderHeaderData(printData, array, filledInfoArray) {

        array.forEach(element => {
            var singleElement = this.fillOrderHeaderData(printData, element)
            filledInfoArray.push(singleElement);

        });
    }
}
