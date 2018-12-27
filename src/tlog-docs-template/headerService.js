import Utils from '../helpers/utils.service';
import TlogDocsTranslateService from './tlogDocsTranslate';
import HtmlCreator from '../helpers/htmlCreator.serivce';


export default class HeaderService {

    constructor(options) {
        this._isUS = options.isUS;
        this.$translate = new TlogDocsTranslateService(options);
        this.$utils = new Utils();
        this.$htmlCreator = new HtmlCreator();
    }


    createHeader(printData, doc, docObj, docData) {
        this._doc = doc;
        this._docObj = docObj;
        this._docData = docData;
        //creating a div to populate and return
        var headerDiv = this._doc.createElement('div');
        headerDiv.id = "headerDiv";


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

        //inner function for placing the constants on the template with data


        var tplHeader = this._doc.createElement('div');
        tplHeader.id = 'tplHeader';
        tplHeader.setAttribute('style', "text-align:center;")
        tplHeader.classList += ' rowPadding'
        var orderHeader = this.createOrderHeader(printData);
        orderHeader.id = 'orderHeader';
        orderHeader.classList += ' rowPadding'

        var tplOrderInfoText = this.createOrderInfoText(printData);
        tplOrderInfoText.id = 'tplOrderInfoText';

        tplHeader.appendChild(tplHeaderConstants);
        tplHeader.appendChild(orderHeader);
        tplHeader.appendChild(tplOrderInfoText);


        headerDiv.appendChild(tplHeader);
        //styling the header
        headerDiv.classList.add('header-div');
        headerDiv.classList.add('header-border');

        return headerDiv;
    }

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
                        tplHeaderLine.innerHTML = printData.variables.ORGANIZATION_LEGAL_NAME;
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
        var orderBasicInfoArray = [tplOrderCustomer, tplOrderTitle, tplOrderDateTime, tplOrderType, tplOrderTable, tplOrderServerClients, tplcCheckNumber];

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

            case 'tplOrderCustomer': {

                if (!this._docObj.isFullOrderBill && printData.collections.PAYMENT_LIST.length > 0 && printData.collections.PAYMENT_LIST[0].CUSTOMER_ID) {

                    var customerName = printData.collections.PAYMENT_LIST[0].CUSTOMER_NAME;
                    var customerId = printData.collections.PAYMENT_LIST[0].CUSTOMER_ID;

                    htmlElement.innerHTML = `<div>${this.$translate.getText("FOR")} ${customerName}</div><div>${this.$translate.getText("BN_OR_SN")} ${customerId}</div>`
                    htmlElement.classList.add('align-text');
                    htmlElement.classList.add('m-bottom-10');
                }
                break;
            }


            case 'tplOrderDateTime': {
                if (printData.variables.CREATED_AT) {

                    let createdDate = this.$utils.toDate({
                        isUS: this._isUS,
                        date: printData.variables.CREATED_AT
                    });

                    htmlElement.innerHTML = createdDate;
                    htmlElement.setAttribute('class', 'med-chars');

                }
                break;
            }

            //Asked to take this down temporary
            case 'tplOrderTitle': {
                if (this._docObj.title) {
                    htmlElement.innerHTML = "<div class='centralize med-chars bold' style='justify-content:center;'>" + this._docObj.title; + "</div >"
                }
                break;
            }

            case 'tplOrderType': {
                if (printData.variables.ORDER_TYPE && printData.variables.ORDER_TYPE.toUpperCase() !== "REFUND") {
                    var typeTranslate = this.$translate.getText("ORDER_TYPE")
                    var orderType = "ORDER_TYPES_" + printData.variables.ORDER_TYPE;
                    var typeDataTranslate = this.$translate.getText(orderType);
                    htmlElement.innerHTML = "<div class='centralize' style='justify-content:center;'>" + this.orderWordsByLocale(typeTranslate, typeDataTranslate, printData.variables.ORDER_NO) + "</div > "
                    htmlElement.setAttribute('class', 'med-chars');

                }
                break;
            }

            case 'tplOrderTable': {
                if (printData.variables.ORDER_TYPE === "SEATED" && printData.variables.TABLE_NO) {
                    var tableTranslate = this.$translate.getText("table")
                    htmlElement.innerHTML = tableTranslate + " " + printData.variables.TABLE_NO;
                    htmlElement.setAttribute('class', 'med-chars');

                }
                break;
            }

            case 'tplOrderServerClients': {
                if (!(this._docData.documentType === "invoice") && !(this._docData.documentType === "deliveryNote")) {
                    var waiterTranslate = this.$translate.getText("Server")
                    var dinersTranslate = this.$translate.getText("Diners")
                    var firstName = printData.variables.F_NAME && printData.variables.F_NAME !== null ? printData.variables.F_NAME : '';
                    var lastName = printData.variables.L_NAME && printData.variables.L_NAME !== null ? printData.variables.L_NAME : '';
                    //htmlElement.innerHTML = `<span>${waiterTranslate} ${firstName} ${lastName.substring(0, 1)} - ${printData.variables.NUMBER_OF_GUESTS} ${dinersTranslate}</span>`;
                    htmlElement.innerHTML = `<span>${waiterTranslate} ${firstName} ${lastName.substring(0, 1)} - </span><span>${printData.variables.NUMBER_OF_GUESTS} ${dinersTranslate}</span>`;

                }
                break;
            }

            case 'tplcCheckNumber': {
                var invoiceNum = printData.collections.PAYMENT_LIST.length > 0 && printData.collections.PAYMENT_LIST[0].NUMBER ? printData.collections.PAYMENT_LIST[0].NUMBER : null;
                if (this._docData.documentType === "invoice" && invoiceNum) {
                    var checkTranslate = this.$translate.getText("INVOICE")
                    printData.collections.PAYMENT_LIST.length > 0 && printData.collections.PAYMENT_LIST[0].NUMBER
                    htmlElement.innerHTML = `<span> ` + checkTranslate + " " + invoiceNum + `</span>`;
                }
                break;
            }

        }
        return htmlElement;

    }

    createOrderInfoText(printData) {
        var tplOrderInfoText = this._doc.createElement('div');
        tplOrderInfoText.id = 'tplOrderInfoText';
        //check if  all the order  is OTH and prints if it is

        if (printData.variables.ORDER_ON_THE_HOUSE === "1") {
            var allOrderOthTextDiv = this._doc.createElement('div');
            allOrderOthTextDiv.id = "allOrderOthTextDiv";
            allOrderOthTextDiv.innerHTML = this.$translate.getText('ALL_ORDER_OTH');
            allOrderOthTextDiv.classList += ' othDiv';
            tplOrderInfoText.appendChild(allOrderOthTextDiv);
        }
        //check if this is a retrun order and prints if it is

        if (printData.data.isReturnOrder && this._docObj.isFullOrderBill) {
            tplOrderInfoText.appendChild(this.createReturnOrderText(printData));
        }

        //check if this is order is tax exempted  and prints if it is
        if (printData.data.isTaxExempt) {
            var taxExemptText = this._doc.createElement('div');
            taxExemptText.id = 'taxExemptText';
            taxExemptText.innerHTML = "<div class='bigBold'>" + this.$translate.getText('EXEMPTED_TAX') + "</div>"
            tplOrderInfoText.appendChild(taxExemptText);

            if (printData.variables.TAX_EXEMPTION_CODE) {


                let elementTaxExemptCode = this.$htmlCreator.create(this._doc, {
                    id: 'tax-exempt-code',
                    type: 'div',
                    classList: ['bold', 'text-transform-none'],
                    value: printData.variables.TAX_EXEMPTION_CODE
                });

                // var isTaxExemptCodeDiv = this._doc.createElement('div');

                // isTaxExemptCodeDiv.id = "isTaxExemptCodeDiv";

                // isTaxExemptCodeDiv.innerHTML = "<div class='bold'>" + printData.variables.TAX_EXEMPTION_CODE; + "</div>"

                tplOrderInfoText.appendChild(elementTaxExemptCode);
            }

            if (printData.variables.TAX_EXEMPTION_COMMENT) {


                let elementTaxExemptComment = this.$htmlCreator.create(this._doc, {
                    id: 'tax-exempt-comment',
                    type: 'div',
                    classList: ['text-transform-none'],
                    value: printData.variables.TAX_EXEMPTION_COMMENT
                });

                // var isTaxExemptCodeDiv = this._doc.createElement('div');

                // isTaxExemptCodeDiv.id = "isTaxExemptCodeDiv";

                // isTaxExemptCodeDiv.innerHTML = printData.variables.TAX_EXEMPTION_COMMENT;

                tplOrderInfoText.appendChild(elementTaxExemptComment);
            }
        }

        return tplOrderInfoText;
    }



    createReturnOrderText(printData) {
        var returnOrderDiv = this._doc.createElement('div')
        returnOrderDiv.classList += ' centralize';
        var isReturnOrderTextDiv = this._doc.createElement('div');
        isReturnOrderTextDiv.id = "isReturnOrderTextDiv";
        isReturnOrderTextDiv.innerHTML = "<div class= bigBold>" + (this.$translate.getText('RETURN_TRANSACTION')) + "</div>";
        returnOrderDiv.appendChild(isReturnOrderTextDiv);
        //return order comment
        if (printData.variables.RETURN_COMMENT) {
            var returnOrderCommentDiv = this._doc.createElement('div');
            returnOrderCommentDiv.id = "returnOrderCommentDiv";
            returnOrderCommentDiv.innerHTML = printData.variables.RETURN_COMMENT;
            returnOrderDiv.appendChild(returnOrderCommentDiv);
        }

        return returnOrderDiv;
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

    isNegative(amount) {
        var intAmount = parseInt(amount);
        return intAmount < 0 ? 'negative' : "";

    }

}
