import HtmlCreator from '../../helpers/htmlCreator.service';
import Utils from '../../helpers/utils.service';
import Localization from '../../helpers/localization.service';
import DocumentFactory from '../../helpers/documentFactory.service';
import TlogDocsTranslateService from '../../tlog-docs-template/tlogDocsTranslate';
import EmvService from '../../tlog-docs-template/emvService';
import CreditTransaction from '../../services/creditTransaction.service';
import {InstallmentsSection} from './Installments';

export default class CreaditSection {
    constructor(options) {
        this.realRegion = options.realRegion || 'il';
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
        const that = this;
        let payment;

        function getCreditCardText(options) {
            const result = options.isRefund ? that.$translate.getText('RETURNED_IN_CREDIT_FROM') : that.$translate.getText('PAID_IN_CREDIT_FROM');

            return result + ` ${options.issuer}`;
        }

        if (this.$localization.allowByRegions(['us', 'au', 'eu'])) {
            payment = options.creditSlipDoc ? options.creditSlipDoc : _.get(options, 'collections.PAYMENT_LIST[0]');
        } else {
            payment = _.get(options, 'collections.CREDIT_PAYMENTS[0]');
        }

        if(!payment) {
            return;
        }

            const creditContainer = this.$htmlCreator.createSection({
                id: 'creadit-section',
                classList: ['creadit-section']
            });

            if (this.$localization.allowByRegions(['il', 'au'])) {const elementCreaditCardText = this.$htmlCreator.create({
                id: 'creadit-card-text',
                classList: ['total-name'],
                value: getCreditCardText({
                    isRefund: options.isRefund,
                    issuer: _.get(payment, 'ISSUER', '')
                })
            });

            const classList = ['total-amount'];
            const negativeClass = this.$utils.isNegative(payment.P_AMOUNT);

            if (negativeClass !== "") {
                classList.push(negativeClass);
            }

            const elementCreaditCardValue = this.$htmlCreator.create({
                id: 'creadit-card-value',
                classList: classList,
                value: this.$utils.toFixedSafe(payment.P_AMOUNT || 0, 2) || ''
            });

            const elementCreaditCardContainer = this.$htmlCreator.create({
                id: 'creadit-card-container',
                classList: ['itemDiv', 'bold'],
                children: [
                    elementCreaditCardText,
                    elementCreaditCardValue
                ]
            });

            creditContainer.append(elementCreaditCardContainer);
        }


        const P_CHANGE = _.get(payment, 'P_CHANGE');

        if (P_CHANGE && P_CHANGE !== 0) {
            const elementChangeText = this.$htmlCreator.create({
                id: 'creadit-change-text',
                classList: ['total-name'],
                value: this.$translate.getText('CHANGE_TIP')
            });

            const classList = ['total-amount'];
            const negativeClass = this.$utils.isNegative(payment.P_CHANGE);
            if (negativeClass !== "") {
                classList.push(negativeClass);
            }

            const elementChangeValue = this.$htmlCreator.create({
                id: 'creadit-change-value',
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

        const len = _.get(payment, 'EMV.length', 0);
        const documentType = _.get(options, 'documentInfo.documentType');
        const hasInstallmentsPayment = !!payment.INSTALLMENTS_COUNT;

        if (hasInstallmentsPayment) {
            this.installmentsSection = new InstallmentsSection(this.options, payment, documentInfo);
            creditContainer.append(this.installmentsSection.get());
        }

        if ((documentType === 'invoice' || documentType === 'creditSlip') && len > 0) {
            const elementEmv = this.$emvService.createEmvTemplate(documentType, {
                variables: options.variables,
                collections: options.collections,
                creditSlipPayment: payment
            }, this._doc);

            creditContainer.append(elementEmv);

        } else if (payment) {
            const elementCreditTransaction = this.$creditTransaction.get({
                realRegion: this.realRegion,
                data: payment
            });

            creditContainer.append(elementCreditTransaction);
        }

        return creditContainer;
    }
}
