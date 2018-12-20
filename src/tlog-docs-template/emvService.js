import TlogDocsUtils from './tlogDocsUtils';
import TlogDocsTranslateService from './tlogDocsTranslate';

export default class emvService {
    constructor(options) {
        this._isUS = options.isUS;
        this.$translate = new TlogDocsTranslateService(options);
        this.$utils = new TlogDocsUtils();
    }

    createEmvTemplate(documentType, printData, doc) {
        this._doc = doc
        let data = this.getEMVData(documentType, printData);

        return this.createEmvHtmlTemplate(data)
    }


    getEMVData(documentType, printData) {
        let emvData;

        if (documentType === 'orderBill') {
            let payment = printData.collections.PAYMENT_LIST.find(p => p.EMV !== undefined);
            emvData = this.resolveEmvData(payment.EMV)

        }
        else if (documentType === 'invoice') {
            let payment = printData.collections.CREDIT_PAYMENTS[0].EMV;
            emvData = this.resolveEmvData(payment.EMV);

        }

        return emvData
    }


    resolveEmvData(collection) {
        console.log('collection: ');
        console.log(collection);

        let list = [];

        collection.forEach(item => {

            // change text.
            if (['uid', 'rrn'].indexOf(item.TYPE) > -1) {
                if (item.TYPE === 'uid') {
                    item.DESC = this.$translate.getText('uid');

                } else {
                    item.DESC = this.$translate.getText('rrn');
                }
            }

            list.push(item);

        });


        let filteredDataList = this.remove(list, 'cardNumber');

        return filteredDataList;

    }

    remove(list, itemType) {
        list.forEach(item => {
            if (item.TYPE === itemType) {
                list.splice(list.indexOf(item), 1);
            }
        })

        return list;
    }



    createEmvHtmlTemplate(data) {
        let emvDiv = this._doc.createElement('div');
        emvDiv.id = 'emvDiv';


        data.forEach(item => {
            let emvItemDiv = this._doc.createElement('div');
            emvItemDiv.className += 'emvItemDiv'
            emvItemDiv.innerHTML = "<div class='itemDiv'>" +
                "<div>" + item.DESC + "</div >" + ": " +
                "<div>" + item.DATA + "</div></div>"

            emvDiv.appendChild(emvItemDiv)
        })

        return emvDiv;

    }
}
