import HtmlCreator from '../../helpers/htmlCreator.service';
import Utils from '../../helpers/utils.service';
import TlogDocsTranslateService from '../../tlog-docs-template/tlogDocsTranslate';

export default class ReturnTransactionSection {

    constructor(options) {
        this.$htmlCreator = new HtmlCreator();
        this.$translate = new TlogDocsTranslateService(options);
        this.$utils = new Utils();
    }

    get(options) {

        let variables = _.get(options, 'variables');
        let collections = _.get(options, 'collections');

        let elementReturnTransactionText = this.$htmlCreator.create({
            id: 'return-transaction-text',
            classList: ['flex', 'centralize', 'bigBold'],
            value: this.$translate.getText('RETURN_TRANSACTION')
        });

        let elementReturnTransactionCommnt = this.$htmlCreator.create({
            id: 'return-transaction-commnt',
            classList: ['flex'],
            value: variables.RETURN_COMMENT || ''
        });

        let elementReturnTransaction = this.$htmlCreator.create({
            id: 'return-transaction',
            classList: ['flex', 'a-center', 'j-center', 'd-col', 'mr-15-0'],
            children: [
                elementReturnTransactionText,
                elementReturnTransactionCommnt
            ]
        });

        return elementReturnTransaction;

    }
}