import HtmlCreator from '../../helpers/htmlCreator.service';
import Utils from '../../helpers/utils.service';
import TlogDocsTranslateService from '../../tlog-docs-template/tlogDocsTranslate';

export default class ReturnTransactionSection {

    constructor(options) {
        this.$htmlCreator = new HtmlCreator();
        this.$translate = new TlogDocsTranslateService(options);
        this.$utils = new Utils(options);
        this.realRegion = options.realRegion || 'il';
        this.timezone = options.timezone;
    }

    get(options) {

        let variables = _.get(options, 'variables');
        let collections = _.get(options, 'collections');
        const elementChildren = [];

        let elementReturnTransactionText = this.$htmlCreator.create({
            id: 'return-transaction-text',
            classList: ['flex', 'centralize', 'bigBold'],
            value: this.$translate.getText('RETURN_TRANSACTION')
        });

        elementChildren.push(elementReturnTransactionText);

        let originalOrderDate = this.$utils.toDate({
            date: variables.CREATED_AT,
            realRegion: this.realRegion,
            timezone: this.timezone,
            withoutTime: true
        });

        let originalOrderReferenceElementValue = this.$translate.getText(
            "RETURN_TRANSACTION_REFERENCE",
            ['orderID', 'orderDate'],
            [variables.SOURCE_ORDER_NUMBER, originalOrderDate]);

        let elementReturnTransactionOriginalOrderReference = this.$htmlCreator.create({
            id: 'return-transaction-original-order',
            classList: ['flex'],
            value: originalOrderReferenceElementValue
        });

        if (!!variables.SOURCE_ORDER_NUMBER && !!variables.SOURCE_ORDER_BUSINESS_DATE && options.showOriginalOrderReference) {
            elementChildren.push(elementReturnTransactionOriginalOrderReference);
        }


        let elementReturnTransactionCommnt = this.$htmlCreator.create({
            id: 'return-transaction-commnt',
            classList: ['flex'],
            value: variables.RETURN_COMMENT || ''
        });

        elementChildren.push(elementReturnTransactionCommnt);

        let elementReturnTransaction = this.$htmlCreator.create({
            id: 'return-transaction',
            classList: ['flex', 'a-center', 'j-center', 'd-col', 'mr-15-0'],
            children: elementChildren
        });

        return elementReturnTransaction;

    }
}
