import TlogDocsUtils from '../tlogDocsUtils';
import TlogDocsTranslateService from '../tlogDocsTranslate';

export default class OrderDataService {

    constructor(options) {
        this._isUS = options.isUS;
        this.$translate = new TlogDocsTranslateService(options);
        this.$utils = new TlogDocsUtils();


    }

    getOrderData(printData, doc, docObj, docData) {

        this._doc = doc;
        this._docObj = docObj;
        this._docData = docData;
        let orderDataDiv = this.createOrderHeader(printData);
        orderDataDiv.id = 'orderDataDiv';

        return orderDataDiv;

    }

    createOrderHeader(printData) {
        //Bring the tplOrderHeader for appending other divs to it
        var tplOrderHeader = this._doc.createElement('div');
        tplOrderHeader.id = 'tplOrderHeader';
        //all order header needed Divs
        var tplOrderCustomer = this._doc.createElement('div');
        tplOrderCustomer.id = "tplOrderCustomer";

        var tplOrderDateTime = this._doc.createElement('div');
        tplOrderDateTime.id = "tplOrderDateTime";
        tplOrderDateTime.classList.add('mystyle');
        var tplOrderTitle = this._doc.createElement('div');
        tplOrderTitle.id = "tplOrderTitle";
        var tplOrderType = this._doc.createElement('div');
        tplOrderType.id = "tplOrderType";
        tplOrderType.setAttribute('style', 'text-align:center;')
        var tplOrderTable = this._doc.createElement('div');
        tplOrderTable.id = "tplOrderTable";
        var tplOrderServerClients = this._doc.createElement('div');
        tplOrderServerClients.id = "tplOrderServerClients";
        var tplcCheckNumber = this._doc.createElement('div');
        tplcCheckNumber.id = "tplcCheckNumber";
        //create array for the appendChildren function
        var orderBasicInfoArray = [tplOrderTitle, tplOrderDateTime, tplOrderType, tplOrderTable, tplOrderServerClients, tplcCheckNumber];

        var filledInfoArray = [];
        this.placeOrderHeaderData(printData, orderBasicInfoArray, filledInfoArray)

        var tplOrderHeaderReturn = this.appendChildren(tplOrderHeader, filledInfoArray)

        return tplOrderHeaderReturn;

    }

    placeOrderHeaderData(printData, array, filledInfoArray) {

        array.forEach(element => {
            var singleElement = this.fillOrderHeaderData(printData, element)
            filledInfoArray.push(singleElement);

        });
    }


    fillOrderHeaderData(printData, htmlElement) {

        switch (htmlElement.id) {
            case 'tplOrderDateTime': {
                if (printData.variables.CREATED_AT) {
                    var dateStr = printData.variables.CREATED_AT;
                    if (this._isUS) htmlElement.innerHTML = this.formatDateUS(dateStr);

                    else if (!this._isUS) {
                        htmlElement.innerHTML = this.formatDateIL(dateStr);
                    }
                    htmlElement.setAttribute('class', 'med-chars');

                }
            }
                break;
            //Asked to take this down temporary
            case 'tplOrderTitle': {
                if (this._docObj.title) {
                    htmlElement.innerHTML = "<div class='centralize med-chars bold' style='justify-content:center;'>" + this._docObj.title; + "</div >"
                }
            }
                break;
            case 'tplOrderType': {
                if (printData.variables.ORDER_TYPE && printData.variables.ORDER_TYPE.toUpperCase() !== "REFUND") {
                    var typeTranslate = this.$translate.getText("ORDER_TYPE")
                    var orderType = "ORDER_TYPES_" + printData.variables.ORDER_TYPE;
                    var typeDataTranslate = this.$translate.getText(orderType);
                    htmlElement.innerHTML = "<div class='centralize' style='justify-content:center;'>" + this.orderWordsByLocale(typeTranslate, typeDataTranslate, printData.variables.ORDER_NO) + "</div > "
                    htmlElement.setAttribute('class', 'med-chars');

                }
            }
                break;
            case 'tplOrderTable': {
                if (printData.variables.ORDER_TYPE === "SEATED" && printData.variables.TABLE_NO) {
                    var tableTranslate = this.$translate.getText("table")
                    htmlElement.innerHTML = tableTranslate + " " + printData.variables.TABLE_NO;
                    htmlElement.setAttribute('class', 'med-chars');

                }
            }
                break;
            case 'tplOrderServerClients': {
                if (!(this._docData.documentType === "invoice") && !(this._docData.documentType === "deliveryNote")) {
                    var waiterTranslate = this.$translate.getText("Server")
                    var dinersTranslate = this.$translate.getText("Diners")
                    var firstName = printData.variables.F_NAME && printData.variables.F_NAME !== null ? printData.variables.F_NAME : '';
                    var lastName = printData.variables.L_NAME && printData.variables.L_NAME !== null ? printData.variables.L_NAME : '';
                    htmlElement.innerHTML = `<span> ` + waiterTranslate + " " + firstName + " " + lastName.substring(0, 1) + " - " + dinersTranslate + " " + printData.variables.NUMBER_OF_GUESTS + `</span>`;
                }
            }
                break;
            case 'tplcCheckNumber': {
                var invoiceNum = printData.collections.PAYMENT_LIST.length > 0 && printData.collections.PAYMENT_LIST[0].NUMBER ? printData.collections.PAYMENT_LIST[0].NUMBER : null;
                if (this._docData.documentType === "invoice" && invoiceNum) {
                    var checkTranslate = this.$translate.getText("INVOICE")
                    printData.collections.PAYMENT_LIST.length > 0 && printData.collections.PAYMENT_LIST[0].NUMBER
                    htmlElement.innerHTML = `<span> ` + checkTranslate + " " + invoiceNum + `</span>`;
                }
            }
                break;


        }
        return htmlElement;

    }

    appendChildren(target, array) {
        var divForAppending = this._doc.createElement('div');
        var length = array.length;
        if (length > 0) {
            array.forEach(element => {
                divForAppending.appendChild(element);
            })
        }
        return divForAppending;
    }

    
    orderWordsByLocale(input1, input2, input3) {
        let htmlString;
        if (this._isUS) {
            htmlString = "<span>" + input2 + "</span>" + "&nbsp;" + "<span>" + input1 + "</span>" + "&nbsp;" + " <span> #" + input3 + "</span >"
        } else {
            htmlString = "<span>" + input1 + "</span>" + "&nbsp;" + "<span>" + input2 + "</span> " + "&nbsp;" + " <span> #" + input3 + "</span >"

        }

        return htmlString;
    }

    formatDateUS(stringDate) {
        var date = new Date(stringDate);
        return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear() + " " + (date.getHours() > 12 ? (date.getHours() - 12) : date.getHours()) + ":" +
            ((date.getMinutes() > 9) ? date.getMinutes() : "0" + date.getMinutes()) + " " + (date.getHours() > 12 ? "PM" : "AM");
    }

    formatDateIL(stringDate) {
        var date = new Date(stringDate);
        return ((date.getHours() > 9) ? date.getHours() : "0" + date.getHours()) + ":" + ((date.getMinutes() > 9) ? date.getMinutes() : "0" + date.getMinutes()) + " " +
            date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + " ";
    }
 
}