import _ from 'lodash';
import Utils from '../helpers/utils.service';
import TlogDocsTranslateService from './tlogDocsTranslate';

export default class emvService {
    constructor(options) {
        this.$translate = new TlogDocsTranslateService(options);
        this.$utils = new Utils();
    }

    createEmvTemplate(documentType, printData, doc) {
        this._doc = doc;
        let data = this.getEMVData(documentType, printData);

        return this.createEmvHtmlTemplate(data);
    }

    getEMVData(documentType, printData) {
        let emvData;

        if (documentType === 'orderBill' || documentType === 'creditSlip') {
            let payment = printData.creditSlipPayment || printData.collections.PAYMENT_LIST.find(p => p.EMV !== undefined);
            // Checking if EMV has TYPE property
            // to remove duplicates if needed
            // only for FreedomPay
            const hasTypeProperty = payment.EMV.every(obj => obj.hasOwnProperty('TYPE'));
            if (hasTypeProperty) {
                payment.EMV = _.uniqBy(payment.EMV, 'TYPE');
            }

            emvData = this.resolveEmvData(payment.EMV)
        } else if (documentType === 'invoice') {
            let emv = printData.collections.CREDIT_PAYMENTS[0].EMV;
            emvData = this.resolveEmvData(emv);
        }

        return emvData
    }

    resolveEmvData(collection) {


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
        emvDiv.className += ' emv-chars';
        emvDiv.className += ' padding-top';
        data.forEach(item => {
            let emvItemDiv = this._doc.createElement('div');
            emvItemDiv.className += 'emvItemDiv'
            emvItemDiv.innerHTML = "<div class='emv-div'>" +
                "<div class='emv-text'>" + item.DESC +  "</div >" +
                "<div class='emv-text'>" + item.DATA + "</div></div>"

            emvDiv.appendChild(emvItemDiv)
        })

        return emvDiv;

    }
}
