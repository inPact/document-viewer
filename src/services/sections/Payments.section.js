import HtmlCreator from '../../helpers/htmlCreator.service';
import Utils from '../../helpers/utils.service';
import TlogDocsTranslateService from '../../tlog-docs-template/tlogDocsTranslate';
import { InstallmentsSection } from "./Installments";
import Localization from "../../helpers/localization.service";

export default class PaymentSection {
    constructor(options) {
        this.$htmlCreator = new HtmlCreator();
        this.$translate = new TlogDocsTranslateService(options);
        this.$utils = new Utils();
        this.options = options;
        this.$localization = new Localization(options);
    }

    get(options) {
        let payments = options.payments;
        let paymentSection = this.$htmlCreator.createSection({
            id: 'payment-section',
            classList: ['payment-section']
        });

        payments.forEach(payment => {
            let elementTextValue = payment.CURRENCY_FACE_VALUE ? '' : payment.name || '';

            if (this.$localization.allowByRegions(['au']) && payment.P_TENDER_TYPE === 'creditCard') {
                if (payment?.ISSUER) {
                    elementTextValue = `${payment.ISSUER}  ${payment.LAST_4}`;
                }
            }

            let elementText = this.$htmlCreator.create({
                id: 'payment-text',
                classList: ['total-name'],
                value: elementTextValue
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

            if (payment.CURRENCY_FACE_VALUE) {
                const currencySymbol = payment.CURRENCY_SYMBOL;
                const paymentLabel = this.$translate.getText(`CURRENCY_PAYMENT_LABEL_${currencySymbol}`);
                const temp = this.$htmlCreator.create({
                    classList: ['bold'],
                    value: paymentLabel
                });

                elementText.appendChild(temp);
            }

            let classListContainer = [];

            switch (payment.type){
                case 'change':
                    classListContainer.push('changeDiv')
                    break;
                case 'paymentRounding':
                    classListContainer.push('paymentRoundingDiv')
                    break;
                default:
                    classListContainer.push('itemDiv')
                    break;
            }

            let elementPaymentContainer = this.$htmlCreator.create({
                id: 'payment-container',
                classList: classListContainer,
                children: [
                    elementText,
                    elementValue
                ]
            });
            paymentSection.append(elementPaymentContainer);

            if (payment.CURRENCY_FACE_VALUE) {
                let currencyPaymentDetailsText = this.$htmlCreator.create({
                    id: 'payment-text',
                    classList: ['total-name'],
                    value: payment.CURRENCY_FACE_VALUE ? '' : payment.name || ''
                });
                const currencyValue = this.$utils.toFixedSafe(payment.CURRENCY_FACE_VALUE, 2);
                const currencyRate = this.$utils.toFixedSafe(payment.CURRENCY_RATE, 3);
                const currencyPaymentDetails = this.$htmlCreator.create({
                    classList: ['bold'],
                    value: this.$translate.getText(`CURRENCY_PAYMENT_DETAILS_${payment.CURRENCY_SYMBOL}`,
                        ['currencyAmount', 'currencySymbol', 'currencyRate'],
                        [currencyValue, payment.CURRENCY_SYMBOL, currencyRate])
                });
                currencyPaymentDetailsText.appendChild(currencyPaymentDetails);

                let currencyDetailsContainer = this.$htmlCreator.create({
                    id: 'payment-container',
                    classList: classListContainer,
                    children: [
                        currencyPaymentDetailsText,
                    ]
                });

                paymentSection.append(currencyDetailsContainer);
            }

            if (payment.P_TENDER_TYPE && payment.P_TENDER_TYPE.includes('cash') && payment.P_BONUS_AMOUNT && payment.P_BONUS_AMOUNT > 0) {
                let elementText = this.$htmlCreator.create({
                    id: 'payment-text',
                    classList: ['total-name'],
                    value: this.$translate.getText("P_BONUS_AMOUNT") || ''
                });

                let elementValue = this.$htmlCreator.create({
                    id: 'payment-value',
                    classList: classList,
                    value: this.$utils.toFixedSafe(payment.P_BONUS_AMOUNT * -1, 2) || ''
                });

                let elementPaymentContainer = this.$htmlCreator.create({
                    id: 'payment-container',
                    classList: classListContainer,
                    children: [
                        elementText,
                        elementValue
                    ]
                });

                paymentSection.append(elementPaymentContainer);
            }

            if (payment.CASH_BAL_DUE !== undefined) {
                let elementText = this.$htmlCreator.create({
                    id: 'payment-text',
                    classList: ['total-name'],
                    value: this.$translate.getText("CASH_BAL_DUE") || ''
                });

                let elementValue = this.$htmlCreator.create({
                    id: 'payment-value',
                    classList: classList,
                    value: this.$utils.toFixedSafe(payment.CASH_BAL_DUE, 2) || ''
                });

                let elementPaymentContainer = this.$htmlCreator.create({
                    id: 'payment-container',
                    classList: classListContainer,
                    children: [
                        elementText,
                        elementValue
                    ]
                });

                paymentSection.append(elementPaymentContainer);
            }

            if (payment.holderName) {

                let elementHolderName = this.$htmlCreator.create({
                    id: 'holder-name',
                    classList: ['holder-name'],
                    value: `&nbsp;${payment.holderName}`
                });

                paymentSection.append(elementHolderName);
            }

            if (payment.HOTEL_NAME || payment.ROOM_NUMBER) {
                let elementHotelDetails = this.$htmlCreator.create({
                    id: 'hotel-details',
                    classList: ['hotel-item', 'hotel-details'],
                    value: `&nbsp;${payment.HOTEL_NAME}&nbsp;/&nbsp;${payment.ROOM_NUMBER}`
                });

                paymentSection.append(elementHotelDetails);
            }

            if (payment.GUEST_NAME && payment.GUEST_NAME.replace(/\s/g, '').length > 0) {
                let elementGuestName = this.$htmlCreator.create({
                    id: 'guest-name',
                    classList: ['hotel-item', 'guest-name'],
                    value: `&nbsp;${payment.GUEST_NAME}`
                });

                paymentSection.append(elementGuestName);
            }

            if (payment.HOTEL_CHECK_NUMBER) {
                let elementHotelCheckNumber = this.$htmlCreator.create({
                    id: 'hotel-check-number',
                    classList: ['hotel-item', 'guest-name'],
                    value: `&nbsp;${this.$translate.getText('HOTEL_CHECK_NUMBER')}&nbsp;${payment.HOTEL_CHECK_NUMBER}`
                });

                paymentSection.append(elementHotelCheckNumber);
            }

            if (payment.HOTEL_NAME && payment.CURRENCY_SYMBOL) {
                const currencyValueText = payment.CURRENCY_SYMBOL + payment.CURRENCY_AMOUNT;
                const elementHotelRoomChargePayment = this.$htmlCreator.create({
                    id: 'room-charge-payment',
                    classList: ['bold'],
                    value: `&nbsp;${this.$translate.getText('HOTELS_ROOM_CHARGE_CURRENCY', ['value'], [currencyValueText])}`
                });

                paymentSection.append(elementHotelRoomChargePayment);
            }

            console.log('au surcharge')
            if (this.$localization.allowByRegions(['au']) && payment.P_TENDER_TYPE === 'creditCard') {
                const elementConfirmationNo = this.$htmlCreator.create({
                    id: 'confirmation-no',
                    classList: ['hotel-item', 'hotel-details'],
                    value: `&nbsp;${this.$translate.getText('CONFIRMATION_NO')} ${payment.CONFIRMATION_NUMBER}&nbsp;`
                });

                paymentSection.append(elementConfirmationNo);

                if (payment.P_FEE_AMOUNT) {
                    const surchargeValue = this.$utils.toFixedSafe(payment.P_FEE_AMOUNT, 2);
                    const elementSurcharge = this.$htmlCreator.create({
                        id: 'surcharge',
                        classList: ['hotel-item', 'hotel-details'],
                        value: `&nbsp;(${this.$translate.getText('SURCHARGE')} ${surchargeValue})&nbsp;`
                    });

                    paymentSection.append(elementSurcharge);
                }
            } else if (payment.PROVIDER_TRANS_ID) {
                let elementProviderTransId = this.$htmlCreator.create({
                    id: 'reference-id',
                    classList: ['hotel-item', 'hotel-details'],
                    value: `&nbsp;${this.$translate.getText('PROVIDER_TRANS_ID')} ${payment.PROVIDER_TRANS_ID}&nbsp;`
                });

                paymentSection.append(elementProviderTransId);
            }

            const hasInstallmentsPayment = !!payment.INSTALLMENTS_COUNT;

            if (hasInstallmentsPayment) {
                this.installmentsSection = new InstallmentsSection(this.options, payment, options.documentInfo);
                paymentSection.append(this.installmentsSection.get());
            }
        });

        return paymentSection;
    }
}
