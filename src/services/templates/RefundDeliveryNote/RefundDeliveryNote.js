

import HtmlCreator from '../../../helpers/htmlCreator.service';
import VatSection from '../../sections/Vat.section';
import ReturnChargeAccount from '../../sections/ReturnChargeAccount';
import HouseAccountPayment from '../../houseAccountPayment.service';
import TlogDocsTranslateService from '../../../tlog-docs-template/tlogDocsTranslate';
import Utils from '../../../helpers/utils.service';
import DocumentFactory from '../../../helpers/documentFactory.service';
import SignatureService from '../../../tlog-docs-template/signatureService';
import _ from "lodash";

export default class RefundDeliveryNote {

    constructor(options) {

        // extensions.
        this.$htmlCreator = new HtmlCreator();
        this.$translate = new TlogDocsTranslateService(options);
        this.$utils = new Utils();

        // services.
        this.$vatSection = new VatSection(options);
        this.$returnChargeAccount = new ReturnChargeAccount(options);
        this.$houseAccountPayment = new HouseAccountPayment(options);
        this.$signatureService = new SignatureService();
    }

    get(options) {

        let isRefund = options.isRefund;
        let variables = options.variables;
        let collections = options.collections;

        let documentInfo = DocumentFactory.getDocumentInfo();

        let elementRefundDeliveryNote = this.$htmlCreator.create({
            id: 'refund-delivery-note',
            classList: ['refund-delivery-note']
        });

        let returnItemsDataSection = this.createReturnItemsData(options)

        // START VAT SECRION
        let elementVatSection = this.$vatSection.get({
            isRefund: isRefund,
            variables: variables,
            collections: collections
        });
        // END VAT SECRION


        // START CHARGE ACCOUNT SECTION
        let elementReturnChargeAccountSection = this.$returnChargeAccount.get({
            variables: variables,
            collections: collections
        });
        // END CHARGE ACCOUNT SECTION


        // START HOUSE ACCOUNT PAYMENT
        let elementHouseAccountPaymentSection = this.$houseAccountPayment.get({
            variables: variables,
            collections: collections
        });
        // END  HOUSE ACCOUNT PAYMENT

        elementRefundDeliveryNote.appendChild(returnItemsDataSection);

        elementRefundDeliveryNote.appendChild(elementVatSection);

        elementRefundDeliveryNote.appendChild(elementReturnChargeAccountSection);

        elementRefundDeliveryNote.appendChild(elementHouseAccountPaymentSection);

        // START SIGNATURE
        if (_.get(documentInfo, 'md.signature')) {

            let elementSignatureArea = this.$htmlCreator.create({
                type: 'div',
                id: 'signature-area',
                classList: ['item-div']
            });

            let elementSignature = this.$signatureService.getSignature(elementSignatureArea);

            elementRefundDeliveryNote.appendChild(elementSignature);
        }
        // END SIGNATURE

        return elementRefundDeliveryNote;

    }

    createReturnItemsData(printData) {
        let returnItemsContainer = this.$htmlCreator.create({
            type: 'div',
            id: 'tplOrderReturnItems',
            classList: ['body-div', 'tpl-body-div']
        });

        const returnOffers = _.get(printData, 'collections.RETURNED_OFFERS_LIST', []);
        const items = [];
        returnOffers.forEach(o => {
            items.push({
                qty: 1,
                name: o['OFFER_NAME'],
                amount: o['OFFER_AMOUNT'],
                isOffer: true,
            })

            if (o.RETURNED_OFFER_DISCOUNTS && o.RETURNED_OFFER_DISCOUNTS.length > 0) {
                o.RETURNED_OFFER_DISCOUNTS.forEach(discount => {
                    items.push({
                        isOfferDiscount: true,
                        name: discount.DISCOUNT_NAME ? discount.DISCOUNT_NAME : this.$translate.getText('MANUAL_ITEM_DISCOUNT'),
                        qty: null,
                        amount: this.$utils.toFixedSafe(discount.DISCOUNT_AMOUNT, 2)
                    })
                });
            }

            const OrderedItemsList = _.get(o,'ORDERED_ITEMS_LIST',[]);
            OrderedItemsList.forEach(i => {
                items.push({
                    qty: 1,
                    name: i['ITEM_NAME'],
                    amount: '',
                    isOffer: false,
                })
            })
        })

        items.forEach((item, index) => {

            if(item.isOffer) {
                // Return items Header
                const returnItemsHeader = document.createElement('div');
                returnItemsHeader.id = "returnItemsHeader";
                returnItemsHeader.innerHTML = this.$translate.getText('ReturnedItem');
                returnItemsHeader.style.margin = index === 0 ? "0px 0 5px 0" : "10px 0 5px 0" ;
                returnItemsHeader.classList += "bold";
                returnItemsContainer.append(returnItemsHeader);
            }

            let elementItemQty = this.$htmlCreator.create({
                type: 'div',
                id: `item-qty-${index}`,
                classList: ['item-qty'],
                value: item.qty
            });

            // remove special chars (html chars as it not render)
            let itemName = _.get(item, 'name', '');
            let name = itemName.replace(/</ig, '').replace(/>/ig, '');
            let elementItemName = this.$htmlCreator.create({
                type: 'div',
                id: `item-name-${index}`,
                classList: ['item-name'],
                value: item.isOffer ? `${name || ''}` : `&nbsp;&nbsp;${name || ''}`
            });

            let classList = ['total-amount'];
            let negativeClass = this.$utils.isNegative(item.amount);
            if (negativeClass !== "") {
                classList.push(negativeClass);
            }

            let elementItemAmount = this.$htmlCreator.create({
                type: 'div',
                id: `item-amount-${index}`,
                classList: classList,
                value: this.$utils.twoDecimals(item.amount)
            });

            let elementItemContainer = this.$htmlCreator.create({
                type: 'div',
                id: `item-${index}`,
                classList: item.isOffer ? ['itemDiv', 'bold'] : ['itemDiv'],
                children: [
                    elementItemQty,
                    elementItemName,
                    elementItemAmount
                ]
            });
            returnItemsContainer.appendChild(elementItemContainer);
        })
        return returnItemsContainer
    }

}
