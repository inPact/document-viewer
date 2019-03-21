import HtmlCreator from '../../helpers/htmlCreator.service';
import Utils from '../../helpers/utils.service';
import TlogDocsTranslateService from '../../tlog-docs-template/tlogDocsTranslate';


export default class ReturnChargeAccount {

    constructor(options) {
        this.$htmlCreator = new HtmlCreator();
        this.$translate = new TlogDocsTranslateService(options);
        this.$utils = new Utils();
    }


    get(options) {

        let variables = options.variables;
        let collections = options.collections;

        let houseAccountPayment = _.get(collections, 'HOUSE_ACCOUNT_PAYMENTS[0]');

        let elementChargeAccountSection = this.$htmlCreator.createSection({
            id: 'return-in-charge-account-from-section',
            classList: ['charge-account-section',],
        });

        let elementChargeAccountText = this.$htmlCreator.create({
            id: 'return-in-charge-account-text',
            classList: ['total-name'],
            value: `${this.$translate.getText('RETURND_IN_CHARCHACCOUNT_FROM')} ${houseAccountPayment.CHARGE_ACCOUNT_NAME}`
        });

        let elementChargeAccountValue = this.$htmlCreator.create({
            id: 'return-in-charge-account-value',
            classList: ['total-amount'],
            value: this.$utils.toFixedSafe(houseAccountPayment.P_AMOUNT || 0, 2) || ''
        });

        let elementChargeAccountContainer = this.$htmlCreator.create({
            id: 'charge-account-container',
            classList: ['charge-account-container', 'itemDiv'],
            children: [
                elementChargeAccountText,
                elementChargeAccountValue
            ]
        });

        elementChargeAccountSection.appendChild(elementChargeAccountContainer);

        if (houseAccountPayment.HOTEL_NAME || houseAccountPayment.GUEST_NAME || houseAccountPayment.ROOM_NUMBER) {

            let elementHotelDetails = this.$htmlCreator.create({
                id: 'hotel-details',
                classList: ['hotel-item', 'hotel-details'],
                value: `&nbsp;${houseAccountPayment.HOTEL_NAME}&nbsp;/&nbsp;${houseAccountPayment.ROOM_NUMBER}`
            });

            elementChargeAccountSection.append(elementHotelDetails);

            let elementGuestName = this.$htmlCreator.create({
                id: 'guest-name',
                classList: ['hotel-item', 'guest-name'],
                value: `&nbsp;${houseAccountPayment.GUEST_NAME}`
            });

            elementChargeAccountSection.append(elementGuestName);

        }

        return elementChargeAccountSection;

    }

}