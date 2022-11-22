import HtmlCreator from '../../helpers/htmlCreator.service';
import Utils from '../../helpers/utils.service';
import TlogDocsTranslateService from '../../tlog-docs-template/tlogDocsTranslate';

export default class PaymentSection {

    constructor(options) {
        this.$htmlCreator = new HtmlCreator();
        this.$translate = new TlogDocsTranslateService(options);
        this.$utils = new Utils();
    }

    getGiftCardLoadRow(payment){
        const loadText = this.$htmlCreator.create({
            id: 'payment-text',
            classList: ['value-name'],
            value: this.$translate.getText('LOAD')
        });

        const loadValue = this.$htmlCreator.create({
            id: 'payment-value',
            classList: ['itemDiv'],
            value: this.$utils.toFixedSafe(payment.amount || 0, 2) || ''
        });

        const elementContainer = this.$htmlCreator.create({
            id: 'payment-container',
            classList: ['element-container'],
            children: [
                loadText,
                loadValue
            ]
        });

        return elementContainer;
    }

    getGiftCardNumberRow(payment){
        const cardNumberText = this.$htmlCreator.create({
            id: 'payment-text',
            classList: ['value-name'],
            value: this.$translate.getText('GIFT_CARD_NUMBER')
        });

        const cardNumberValue = this.$htmlCreator.create({
            id: 'payment-value',
            classList: ['value-name'],
            value: payment?.giftCardNumber || ''
        });

        const elementContainer = this.$htmlCreator.create({
            id: 'payment-container',
            classList: ['element-container'],
            children: [
                cardNumberText,
                cardNumberValue
            ]
        });
        return elementContainer;
    }

    getGiftCardBalanceRow(payment){
        const remainingBalanceText = this.$htmlCreator.create({
            id: 'payment-text',
            classList: ['value-name'],
            value: this.$translate.getText('REMAINING_BALANCE')
        });

        const remainingBalanceValue = this.$htmlCreator.create({
            id: 'payment-value',
            classList: ['value-name'],
            value: payment.giftCardBalance || ''
        });

        const elementContainer = this.$htmlCreator.create({
            id: 'payment-container',
            classList: ['element-container'],
            children: [
                remainingBalanceText,
                remainingBalanceValue
            ]
        });
        return elementContainer;
    }

    getMediaExchangePaymentSection(options){
        // Shows the cards loaded, amount for each, remaining balance.
        const variables = options.variables;
        const payments = options.payments;

        const paymentSection = this.$htmlCreator.createSection({
            id: 'payment-section',
            classList: ['payment-section']
        });

        payments.forEach((payment)=>{
            if(payment.giftCardNumber){
                const giftCardLoadContainer = this.$htmlCreator.create({
                    id: 'gift-card-load-container',
                    classList: ['load-container'],
                    children: [
                        this.getGiftCardLoadRow(payment),
                        this.getGiftCardNumberRow(payment),
                        this.getGiftCardBalanceRow(payment)
                    ]
                });
                paymentSection.append(giftCardLoadContainer);
            }
        })

        return paymentSection;
    }



    get(options) {
        const variables = options.variables;
        const payments = options.payments;
        console.log('zohar -- payments', payments);
        console.log('zohar -- variables', variables);

        const paymentSection = this.$htmlCreator.createSection({
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

            if (payment.CURRENCY_AMOUNT) {
                const currencyValue = this.$utils.toFixedSafe(payment.CURRENCY_AMOUNT, 2);
                const currencySymbol = payment.CURRENCY_SYMBOL;
                const temp = this.$htmlCreator.create({
                    classList: ['payment-currency'],
                    value: `(${currencySymbol}${currencyValue})`
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

            if (payment.name.includes('Cash') && payment.P_BONUS_AMOUNT !== undefined) {
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

            if (payment.PROVIDER_TRANS_ID) {
                let elementProviderTransId = this.$htmlCreator.create({
                    id: 'reference-id',
                    classList: ['hotel-item', 'hotel-details'],
                    value: `&nbsp;${this.$translate.getText('PROVIDER_TRANS_ID')} ${payment.PROVIDER_TRANS_ID}&nbsp;`
                });
                paymentSection.append(elementProviderTransId);
            }
        });

        return paymentSection;
    }
}
