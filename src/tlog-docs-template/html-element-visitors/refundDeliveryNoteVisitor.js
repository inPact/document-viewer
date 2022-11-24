import HtmlCreator from '../../helpers/htmlCreator.service';
import RefundDeliveryNote from '../../services/templates/RefundDeliveryNote/RefundDeliveryNote';
const htmlCreator = new HtmlCreator();

export const RefundDeliveryNoteVisitor = {
    visit(context) {
        if (context.docInfo.isRefundDeliveryNote && context.docInfo.type !== 'clubMembers') {
            this.refundDeliveryNoteService = new RefundDeliveryNote(context.options);
            return this.createSection(context);
        }
    },
    createSection(context) {
        const elements = [];
        const refundDeliveryNote = this.refundDeliveryNoteService.get({
            isRefund: context.docInfo.isRefund,
            variables: context._printData.variables,
            collections: context._printData.collections
        });

        elements.push(refundDeliveryNote);
        return elements;
    }
};
