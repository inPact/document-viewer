import HtmlCreator from '../../helpers/htmlCreator.service';
import Utils from '../../helpers/utils.service';
import Localization from '../../helpers/localization.service';
import DocumentFactory from '../../helpers/documentFactory.service';
import TlogDocsTranslateService from '../../tlog-docs-template/tlogDocsTranslate';
import EmvService from '../../tlog-docs-template/emvService';
import CreditTransaction from '../../services/creditTransaction.service';

export default class CreditSection {
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
        const that = this;

        function getCreditCardText(options) {
            const result = options.isRefund ? that.$translate.getText('RETURNED_IN_CREDIT_FROM') : that.$translate.getText('PAID_IN_CREDIT_FROM');

            return result + ` ${ options.issuer }`;
        }

        const payment = _.get(options, 'collections.CREDIT_PAYMENTS[0]');

        const creditContainer = this.$htmlCreator.createSection({
            id: 'credit-section',
            classList: ['credit-section']
        });

        const elementCreditCardText = this.$htmlCreator.create({
            id: 'credit-card-text',
            classList: ['total-name'],
            value: getCreditCardText({
                isRefund: options.isRefund,
                issuer: payment.ISSUER
            })
        });

        const classList = ['total-amount'];
        const negativeClass = this.$utils.isNegative(payment.P_AMOUNT);

        if (negativeClass !== "") {
            classList.push(negativeClass);
        }

        const elementCreditCardValue = this.$htmlCreator.create({
            id: 'credit-card-value',
            classList: classList,
            value: this.$utils.toFixedSafe(payment.P_AMOUNT || 0, 2) || ''
        });

        const elementCreditCardContainer = this.$htmlCreator.create({
            id: 'credit-card-container',
            classList: ['itemDiv', 'bold'],
            children: [
                elementCreditCardText,
                elementCreditCardValue
            ]
        });

        creditContainer.append(elementCreditCardContainer);

        const P_CHANGE = _.get(payment, 'P_CHANGE');

        if (P_CHANGE && P_CHANGE !== 0) {
            const elementChangeText = this.$htmlCreator.create({
                id: 'credit-change-text',
                classList: ['total-name'],
                value: this.$translate.getText('CHANGE_TIP')
            });

            const classList = ['total-amount'];
            const negativeClass = this.$utils.isNegative(payment.P_CHANGE);
            if (negativeClass !== "") {
                classList.push(negativeClass);
            }

            const elementChangeValue = this.$htmlCreator.create({
                id: 'credit-change-value',
                classList: classList,
                value: this.$utils.toFixedSafe(payment.P_CHANGE || 0, 2) || ''
            });

            const elementChangeContainer = this.$htmlCreator.create({
                id: 'change-container',
                classList: ['itemDiv', 'bold'],
                children: [
                    elementChangeText,
                    elementChangeValue
                ]
            });

            creditContainer.append(elementChangeContainer);
        }

        const installmentsSection = this.getInstallmentsSection(payment);
        if (installmentsSection) {
            creditContainer.append(installmentsSection);
        }


        const len = _.get(payment, 'EMV.length', 0);
        const documentType = _.get(options, 'documentInfo.documentType');

        if (documentType === 'invoice' && len > 0) {
            const elementEmv = this.$emvService.createEmvTemplate(documentType, {
                variables: options.variables,
                collections: options.collections
            }, this._doc);

            creditContainer.append(elementEmv);

        } else if (payment) {
            const elementCreditTransaction = this.$creditTransaction.get({
                isUS: this.$localization.isUS,
                data: payment
            });

            creditContainer.append(elementCreditTransaction);
        }

        return creditContainer;
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
