import HtmlCreator from '../../helpers/htmlCreator.service';
import Utils from '../../helpers/utils.service';
import TlogDocsTranslateService from '../../tlog-docs-template/tlogDocsTranslate';

export default class PaymentSection {

    constructor(options) {
        this.$htmlCreator = new HtmlCreator();
        this.$translate = new TlogDocsTranslateService(options);
        this.$utils = new Utils();
    }

    get(options) {
        debugger
        let variables = options.variables;
        let collections = options.collections;
        let payments = options.payments;

        let paymentSection = this.$htmlCreator.createSection({
            id: 'payment-section',
            classList: ['payment-section']
        });


        payments.forEach(payment => {

            let elementText = this.$htmlCreator.create({
                id: 'payment-text',
                classList: ['total-name'],
                value: payment.name || ''
            });

            let classList = ['total-amount'];
            let negativeClass = this.$utils.isNegative(payment.amount);
            if (negativeClass !== "") {
                classList.push(negativeClass);
            }

            let elementValue = this.$htmlCreator.create({
                id: 'payment-value',
                classList: classList,
                value: this.$utils.toFixedSafe(payment.amount || 0, 2) || ''
            });

            let classListContainer = [];
            classListContainer.push(payment.type === 'change' ? 'changeDiv' : 'itemDiv');

            let elementPaymentContainer = this.$htmlCreator.create({
                id: 'payment-container',
                classList: classListContainer,
                children: [
                    elementText,
                    elementValue
                ]
            });

            paymentSection.append(elementPaymentContainer);

            if (payment.holderName) {

                let elementHolderName = this.$htmlCreator.create({
                    id: 'holder-name',
                    classList: ['holder-name'],
                    value: `&nbsp;${payment.holderName}`
                });

                paymentSection.append(elementHolderName);
            }

            if (payment.HOTEL_NAME || payment.GUEST_NAME || payment.ROOM_NUMBER || payment.HOTEL_CHECK_NUMBER) {

                if (payment.HOTEL_NAME || payment.ROOM_NUMBER) {
                    let elementHotelDetails = this.$htmlCreator.create({
                        id: 'hotel-details',
                        classList: ['hotel-item', 'hotel-details'],
                        value: `&nbsp;${payment.HOTEL_NAME}&nbsp;/&nbsp;${payment.ROOM_NUMBER}`
                    });
                    paymentSection.append(elementHotelDetails);
                }


                if (payment.GUEST_NAME.replace(/\s/g, '').length > 0) {
                    let elementGuestName = this.$htmlCreator.create({
                        id: 'guest-name',
                        classList: ['hotel-item', 'guest-name'],
                        value: `&nbsp;${payment.GUEST_NAME}`
                    });

                    paymentSection.append(elementGuestName);
                }


                if(payment.HOTEL_CHECK_NUMBER) {
                    let elementHotelCheckNumber = this.$htmlCreator.create({
                        id: 'hotel-check-number',
                        classList: ['hotel-item', 'guest-name'],
                        value: `&nbsp;${this.$translate.getText('HOTEL_CHECK_NUMBER')}&nbsp;${payment.HOTEL_CHECK_NUMBER}`
                    });
                    paymentSection.append(elementHotelCheckNumber);
                }
               


            }

        });

        return paymentSection;

    }

}