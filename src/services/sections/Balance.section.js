import HtmlCreator from '../../helpers/htmlCreator.service';
import Utils from '../../helpers/utils.service';
import TlogDocsTranslateService from '../../tlog-docs-template/tlogDocsTranslate';

export default class BalanceSection {

    constructor(options) {
        this.$htmlCreator = new HtmlCreator();
        this.$translate = new TlogDocsTranslateService(options);
        this.$utils = new Utils();
    }

    get(options) {

        let variables = options.variables;
        let collections = options.collections;

        let balanceContainer = this.$htmlCreator.createSection({
            id: 'balance-section',
            classList: ['balance-section']
        });

        let elementBalanceText = this.$htmlCreator.create({
            id: 'balance-text',
            classList: ['balance-name'],
            value: this.$translate.getText('Balance')
        });

        let classList = ['balance-amount'];
        let negativeClass = this.$utils.isNegative(variables.BAL_DUE);
        if (negativeClass !== "") {
            classList.push(negativeClass);
        }

        let elementBalanceValue = this.$htmlCreator.create({
            id: 'balance-value',
            classList: classList,
            value: this.$utils.toFixedSafe(variables.BAL_DUE || 0, 2) || ''
        });

        let elementBalanceContainer = this.$htmlCreator.create({
            id: 'balance-container',
            classList: ['itemDiv'],
            children: [
                elementBalanceText,
                elementBalanceValue
            ]
        });

        balanceContainer.append(elementBalanceContainer);

        return balanceContainer;

    }
}
