import Utils from '../helpers/utils.service';
import TlogDocsTranslateService from './tlogDocsTranslate';
import VatTemplateService from './vatTemplateService';
import SignatureService from './signatureService';

import HouseAccountPayment from '../services/houseAccountPayment.service';
import DocumentFactory from '../helpers/documentFactory.service';
import HtmlCreator from '../helpers/htmlCreator.service';

export default class DeliveryNoteTransactionDataService {
    constructor(options) {
        this.realRegion = options.realRegion || 'il';
        this.$translate = new TlogDocsTranslateService(options);
        this.$vatTemplateService = new VatTemplateService(options);
        this.$utils = new Utils();
        this.$houseAccountPayment = new HouseAccountPayment(options);
        this.$htmlCreator = new HtmlCreator();
        this.$signatureService = new SignatureService();
    }


    createDeliveryNoteTransactionData(options) {
        const IS_REFUND = options.IS_REFUND;

        this._doc = DocumentFactory.get();

        let printData = DocumentFactory.getPrintData();
        let documentInfo = DocumentFactory.getDocumentInfo();


        var deliveryNoteTransactionDiv = this._doc.createElement('div');
        deliveryNoteTransactionDiv.id = 'deliveryNoteTransactionDiv';

        var deliveryVat = this.$vatTemplateService.createVatTemplate({
            isRefund: IS_REFUND,
            printData: printData
        });
        printData, this._doc
        deliveryVat.id = 'deliveryVat';

        deliveryVat.classList += ' padding-bottom';
        deliveryVat.classList += ' border-top';
        deliveryVat.classList += ' tpl-body-div';

        deliveryNoteTransactionDiv.appendChild(deliveryVat);


        let hAccountPayments = _.get(printData, 'collections.HOUSE_ACCOUNT_PAYMENTS[0]');
        var dNoteChargeAccntDiv = this._doc.createElement('div');
        dNoteChargeAccntDiv.id = 'dNoteChargeAccntDiv';

        let elementChargeAccountSection = this.$htmlCreator.createSection({
            id: 'charge-account-section',
            classList: ['border-bottom']
        });


        if (IS_REFUND === true) {

            let elementChargeAccountText = this.$htmlCreator.create({
                id: 'charge-account-text',
                classList: ['total-name'],
                value: this.$translate.getText('RETURND_IN_CHARCHACCOUNT_FROM') + " " + hAccountPayments.CHARGE_ACCOUNT_NAME
            });

            let classList = ['total-amount'];
            let negativeClass = this.$utils.isNegative(hAccountPayments.P_AMOUNT);
            if (negativeClass !== "") {
                classList.push(negativeClass);
            }

            let elementChargeAccountValue = this.$htmlCreator.create({
                id: 'charge-account-value',
                classList: classList,
                value: this.$utils.toFixedSafe(hAccountPayments.P_AMOUNT || 0, 2) || ''
            });

            let elementChargeAccountContainer = this.$htmlCreator.create({
                id: 'charge-account-refund-container',
                classList: ['itemDiv'],
                children: [
                    elementChargeAccountText,
                    elementChargeAccountValue
                ]
            });


            elementChargeAccountSection.appendChild(elementChargeAccountContainer);


            if (hAccountPayments.HOTEL_NAME || hAccountPayments.GUEST_NAME || hAccountPayments.ROOM_NUMBER || hAccountPayments.HOTEL_CHECK_NUMBER) {
                if (hAccountPayments.HOTEL_NAME || hAccountPayments.ROOM_NUMBER) {
                    let elementHotelDetails = this.$htmlCreator.create({
                        id: 'hotel-details',
                        classList: ['hotel-item', 'hotel-details'],
                        value: `&nbsp;${hAccountPayments.HOTEL_NAME}&nbsp;/&nbsp;${hAccountPayments.ROOM_NUMBER}`
                    });
                    elementChargeAccountSection.append(elementHotelDetails);
                }

                if (hAccountPayments.GUEST_NAME.replace(/\s/g, '').length > 0) {
                    let elementGuestName = this.$htmlCreator.create({
                        id: 'guest-name',
                        classList: ['hotel-item', 'guest-name'],
                        value: `&nbsp;${hAccountPayments.GUEST_NAME}`
                    });

                    elementChargeAccountSection.append(elementGuestName);

                }

                if (hAccountPayments.HOTEL_CHECK_NUMBER) {
                    let elementHotelCheckNumber = this.$htmlCreator.create({
                        id: 'hotel-check-number',
                        classList: ['hotel-item', 'guest-name'],
                        value: `&nbsp;${this.$translate.getText('HOTEL_CHECK_NUMBER')}&nbsp;${hAccountPayments.HOTEL_CHECK_NUMBER}`
                    });

                    elementChargeAccountSection.append(elementHotelCheckNumber);
                }
            }
        }
        else if (!IS_REFUND && hAccountPayments && hAccountPayments.P_AMOUNT) {

            let elementChargeAccountText = this.$htmlCreator.create({
                id: 'charge-account-text',
                classList: ['total-name'],
                value: this.$translate.getText('PAID_IN_CHARCHACCOUNT_FROM') + " " + hAccountPayments.CHARGE_ACCOUNT_NAME
            });

            let classList = ['total-amount'];
            let negativeClass = this.$utils.isNegative(hAccountPayments.P_AMOUNT);
            if (negativeClass !== "") {
                classList.push(negativeClass);
            }

            let elementChargeAccountValue = this.$htmlCreator.create({
                id: 'charge-account-value',
                classList: classList,
                value: this.$utils.toFixedSafe(hAccountPayments.P_AMOUNT || 0, 2) || ''
            });

            let elementChargeAccountContainer = this.$htmlCreator.create({
                id: 'charge-account-refund-container',
                classList: ['itemDiv'],
                children: [
                    elementChargeAccountText,
                    elementChargeAccountValue
                ]
            });

            elementChargeAccountSection.appendChild(elementChargeAccountContainer);

            if (hAccountPayments.HOTEL_NAME || hAccountPayments.GUEST_NAME || hAccountPayments.ROOM_NUMBER || hAccountPayments.HOTEL_CHECK_NUMBER) {

                if (hAccountPayments.HOTEL_NAME || hAccountPayments.ROOM_NUMBER) {
                    let elementHotelDetails = this.$htmlCreator.create({
                        id: 'hotel-details',
                        classList: ['hotel-item', 'hotel-details'],
                        value: `&nbsp;${hAccountPayments.HOTEL_NAME}&nbsp;/&nbsp;${hAccountPayments.ROOM_NUMBER}`
                    });

                    elementChargeAccountSection.append(elementHotelDetails);
                }

                if (hAccountPayments.GUEST_NAME.replace(/\s/g, '').length > 0) { 
                    let elementGuestName = this.$htmlCreator.create({
                        id: 'guest-name',
                        classList: ['hotel-item', 'guest-name'],
                        value: `&nbsp;${hAccountPayments.GUEST_NAME}`
                    });
    
                    elementChargeAccountSection.append(elementGuestName);
                }
              
                if(hAccountPayments.HOTEL_CHECK_NUMBER) {
                    let elementHotelCheckNumber = this.$htmlCreator.create({
                        id: 'hotel-check-number',
                        classList: ['hotel-item', 'guest-name'],
                        value: `&nbsp;${this.$translate.getText('HOTEL_CHECK_NUMBER')}${hAccountPayments.HOTEL_CHECK_NUMBER}`
                    });
    
                    elementChargeAccountSection.append(elementHotelCheckNumber);
                }

            


            }

            if (hAccountPayments.P_CHANGE > 0) {


                let elementTotalCashbackText = this.$htmlCreator.create({
                    id: 'total-cash-back-text',
                    classList: ['total-name'],
                    value: this.$translate.getText('CHANGE_TIP')
                });

                let classList = ['total-amount'];
                let negativeClass = this.$utils.isNegative(hAccountPayments.P_CHANGE);
                if (negativeClass !== "") {
                    classList.push(negativeClass);
                }

                let elementTotalCashbackValue = this.$htmlCreator.create({
                    id: 'total-cash-back-value',
                    classList: classList,
                    value: this.$utils.toFixedSafe(hAccountPayments.P_CHANGE || 0, 2) || ''
                });

                let elementTotalCashbackContainer = this.$htmlCreator.create({
                    id: 'total-cash-back-container',
                    classList: ['itemDiv'],
                    children: [
                        elementTotalCashbackText,
                        elementTotalCashbackValue
                    ]
                });

                elementChargeAccountSection.appendChild(elementTotalCashbackContainer);
            }


            dNoteChargeAccntDiv.append(elementChargeAccountSection);


        }


        /**
         * Add House Account Payment Section.
         */
        if (hAccountPayments) {

            let elementHouseAccountPayment = this.$houseAccountPayment.get({
                variables: printData.variables,
                collections: printData.collections
            })

            dNoteChargeAccntDiv.appendChild(elementHouseAccountPayment);
        }


        if (_.get(documentInfo, 'md.signature')) {

            let elementSignatureArea = this.$htmlCreator.create({
                type: 'div',
                id: 'signature-area',
                classList: ['item-div']
            });

            let elementSignature = this.$signatureService.getSignature(elementSignatureArea);

            dNoteChargeAccntDiv.appendChild(elementSignature);
        }



        dNoteChargeAccntDiv.classList += ' tpl-body-div';
        deliveryNoteTransactionDiv.appendChild(dNoteChargeAccntDiv);
        return deliveryNoteTransactionDiv;
    }
}
