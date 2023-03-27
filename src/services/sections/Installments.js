import HtmlCreator from "../../helpers/htmlCreator.service";
import TlogDocsTranslateService from "../../tlog-docs-template/tlogDocsTranslate";

export class InstallmentsSection {
    constructor(options, payment, documentInfo) {
        this.$htmlCreator = new HtmlCreator();
        this.$translate = new TlogDocsTranslateService(options);
        this.payment = payment;
        this.documentType = _.get(documentInfo, 'documentType', '')
    }

    get() {
        const hasUnequalInstallments = _.get(this.payment, 'FIRST_INSTALLMENTS_AMOUNT')
            && _.get(this.payment, 'REST_INSTALLMENTS_AMOUNT');

        return hasUnequalInstallments ? this.unequalInstallmentsSection : this.equalInstallmentsSection;
    }

    get equalInstallmentsSection() {
        return this.$htmlCreator.create({
            id: 'installments',
            classList: ['credit-installments', this.documentType],
            value: this.$translate.getText('EQUAL_INSTALLMENTS',
                ["installmentsCount", "installmentsAmount"],
                [(this.payment.INSTALLMENTS_COUNT), this.payment.REST_INSTALLMENTS_AMOUNT]
            )
        });
    }

    get unequalInstallmentsSection() {

        const installmentsCountElement = this.$htmlCreator.create({
            id: 'installments-count',
            classList: ['total-name'],
            value: this.$translate.getText('INSTALLMENTS_CREDIT_TRANSACTION',
                ["installmentsCount"],
                [this.payment.INSTALLMENTS_COUNT]
            )
        });

        const firstInstallmentElement = this.$htmlCreator.create({
            id: 'first-installment',
            classList: ['total-name'],
            value: this.$translate.getText('FIRST_INSTALLMENT',
                ["installmentAmount"],
                [this.payment.FIRST_INSTALLMENTS_AMOUNT]
            )
        });

        const restInstallmentsElement = this.$htmlCreator.create({
            id: 'rest-installments',
            classList: ['total-name'],
            value: this.$translate.getText('REST_INSTALLMENTS',
                ["restInstallmentsCount", "installmentsAmount"],
                [(this.payment.INSTALLMENTS_COUNT - 1), this.payment.REST_INSTALLMENTS_AMOUNT]
            )
        });


        return this.$htmlCreator.create({
            id: 'installments-container',
            classList: ['credit-installments', 'unequal-installments', this.documentType],
            children: [installmentsCountElement, firstInstallmentElement, restInstallmentsElement],
        });

    }
}