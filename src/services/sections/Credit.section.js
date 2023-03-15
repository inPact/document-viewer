import HtmlCreator from '../../helpers/htmlCreator.service';
import Utils from '../../helpers/utils.service';
import Localization from '../../helpers/localization.service';
import DocumentFactory from '../../helpers/documentFactory.service';
import TlogDocsTranslateService from '../../tlog-docs-template/tlogDocsTranslate';
import EmvService from '../../tlog-docs-template/emvService';
import CreditTransaction from '../../services/creditTransaction.service';
import { InstallmentsSection } from './Installments';

export default class CreaditSection {
    constructor(options) {
        this.$htmlCreator = new HtmlCreator();
        this.$translate = new TlogDocsTranslateService(options);
        this.$utils = new Utils();
        this.$emvService = new EmvService(options);
        this.$creditTransaction = new CreditTransaction(options);
        this.$localization = new Localization(options);
        this._doc = DocumentFactory.get();
        this.options = options;
    }

    get(options) {

        let that = this;

        function getCreaditFromText(options) {

            let isRefund = options.isRefund;
            let issuer = options.issuer;

            let result = "";

            if (isRefund) {
                result += that.$translate.getText('RETURNED_IN_CREDIT_FROM');
            } else {
                result += that.$translate.getText('PAID_IN_CREDIT_FROM');
            }

            result += ` ${ issuer }`;
            return result;
        }

        let variables = options.variables;
        let collections = options.collections;
        let documentInfo = options.documentInfo;
        let isRefund = options.isRefund;

        let payment = collections.CREDIT_PAYMENTS[0];

        let creaditContainer = this.$htmlCreator.createSection({
            id: 'creadit-section',
            classList: ['creadit-section']
        });

        //#region Creadit from

        let elementCreaditCardText = this.$htmlCreator.create({
            id: 'creadit-card-text',
            classList: ['total-name'],
            value: getCreaditFromText({
                isRefund: isRefund,
                issuer: payment.ISSUER
            })
        });

        let classList = ['total-amount'];
        let negativeClass = this.$utils.isNegative(payment.P_AMOUNT);
        if (negativeClass !== "") {
            classList.push(negativeClass);
        }

        let elementCreaditCardValue = this.$htmlCreator.create({
            id: 'creadit-card-value',
            classList: classList,
            value: this.$utils.toFixedSafe(payment.P_AMOUNT || 0, 2) || ''
        });

        let elementCreaditCardContainer = this.$htmlCreator.create({
            id: 'creadit-card-container',
            classList: ['itemDiv', 'bold'],
            children: [
                elementCreaditCardText,
                elementCreaditCardValue
            ]
        });

        creaditContainer.append(elementCreaditCardContainer);

        //#endregion

        //#region Creadit change

        let P_CHANGE = _.get(payment, 'P_CHANGE');
        if (P_CHANGE && P_CHANGE !== 0) {

            let elementChangeText = this.$htmlCreator.create({
                id: 'creadit-change-text',
                classList: ['total-name'],
                value: this.$translate.getText('CHANGE_TIP')
            });

            let classList = ['total-amount'];
            let negativeClass = this.$utils.isNegative(payment.P_CHANGE);
            if (negativeClass !== "") {
                classList.push(negativeClass);
            }

            let elementChangeValue = this.$htmlCreator.create({
                id: 'creadit-change-value',
                classList: classList,
                value: this.$utils.toFixedSafe(payment.P_CHANGE || 0, 2) || ''
            });

            let elementChangeContainer = this.$htmlCreator.create({
                id: 'change-container',
                classList: ['itemDiv', 'bold'],
                children: [
                    elementChangeText,
                    elementChangeValue
                ]
            });

            creaditContainer.append(elementChangeContainer);

        }

        //#endregion

        //#region Creadit change

        let len = _.get(collections, 'CREDIT_PAYMENTS[0].EMV.length') || 0;
        const documentType = _.get(options, 'documentInfo.documentType');
        const hasInstallmentsPayment = !!payment.INSTALLMENTS_COUNT;

        if (hasInstallmentsPayment) {
            this.installmentsSections = new InstallmentsSection(this.options, payment);
            creaditContainer.append(this.installmentsSections.get());
        }

        if (documentType === 'invoice' && len > 0) {
            const elementEmv = this.$emvService.createEmvTemplate(documentType, {
                variables: variables,
                collections: collections
            }, this._doc);

            creaditContainer.append(elementEmv);

        } else if (payment) {
            let elementCreditTransaction = this.$creditTransaction.get({
                isUS: this.$localization.isUS,
                data: payment
            });

            creaditContainer.append(elementCreditTransaction);
        }

        //#endregion

        return creaditContainer;
    }
}
