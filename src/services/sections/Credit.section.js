import HtmlCreator from '../../helpers/htmlCreator.service';
import Utils from '../../helpers/utils.service';
import Localization from '../../helpers/localization.service';
import DocumentFactory from '../../helpers/documentFactory.service';
import TlogDocsTranslateService from '../../tlog-docs-template/tlogDocsTranslate';
import EmvService from '../../tlog-docs-template/emvService';
import CreditTransaction from '../../services/creditTransaction.service';

export default class CreaditSection {
    constructor(options) {
        this.$htmlCreator = new HtmlCreator();
        this.$translate = new TlogDocsTranslateService(options);
        this.$utils = new Utils();
        this.$emvService = new EmvService(options);
        this.$creditTransaction = new CreditTransaction(options);
        this.$localization = new Localization(options);
        this._doc = DocumentFactory.get();
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

            result += ` ${issuer}`;
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

        const installmentsSection = this.getInstallmentsSection(payment);
        if (installmentsSection) {
            creaditContainer.append(installmentsSection);
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

    getInstallmentsSection(payment) {
        const isInstallmentsPayment = !!payment.INSTALLMENTS_COUNT;
        if (!isInstallmentsPayment) {
            return;
        }

        let installmentsSection;
        const hasUnequalInstallments = payment.FIRST_INSTALLMENTS_AMOUNT && payment.REST_INSTALLMENTS_AMOUNT;

        if (hasUnequalInstallments) {
            installmentsSection = this.$htmlCreator.create({
                id: 'installments-container',
                classList: ['credit-installments', 'unequal-installments'],
                children: this.getUnequalInstallmentsElements(payment)
            });

        } else {
            const installments = this.$translate.getText('EQUAL_INSTALLMENTS',
                ["installmentsCount", "installmentsAmount"],
                [(payment.INSTALLMENTS_COUNT), payment.REST_INSTALLMENTS_AMOUNT]
            );

            installmentsSection = this.$htmlCreator.create({
                id: 'installments',
                classList: ['credit-installments'],
                value: installments
            });
        }
        return installmentsSection;
    }

    getUnequalInstallmentsElements(payment) {
        const installmentsCount = this.$translate.getText('INSTALLMENTS_CREDIT_TRANSACTION',
            ["installmentsCount"],
            [payment.INSTALLMENTS_COUNT]
        );

        const firstInstallment = this.$translate.getText('FIRST_INSTALLMENT',
            ["installmentAmount"],
            [payment.FIRST_INSTALLMENTS_AMOUNT]
        );

        const restInstallments = this.$translate.getText('REST_INSTALLMENTS',
            ["restInstallmentsCount", "installmentsAmount"],
            [(payment.INSTALLMENTS_COUNT - 1), payment.REST_INSTALLMENTS_AMOUNT]
        );

        const installmentsCountElement = this.$htmlCreator.create({
            id: 'installments-count',
            classList: ['total-name'],
            value: installmentsCount
        });

        const firstInstallmentElement = this.$htmlCreator.create({
            id: 'first-installment',
            classList: ['total-name'],
            value: firstInstallment
        });

        const restInstallmentsElement = this.$htmlCreator.create({
            id: 'rest-installments',
            classList: ['total-name'],
            value: restInstallments
        });

        return [installmentsCountElement, firstInstallmentElement, restInstallmentsElement];
    }
}
