import TemplateBuilderService from '../templateBuilderService';

// // const templateBuilderService = new TemplateBuilderService();
//
// console.log(TemplateBuilderService.prototype.createMediaExchange());

export const MediaExchangeVisitor = {
    visit(context) {
        const docInfo = context.docInfo;
        const region = context._realRegion;

        if (region === 'us') return;
        if (docInfo.isMediaExchange && !docInfo.isCreditSlip && !docInfo.isGiftCardSlip) {
            return this.createSection(context);
        }
    },
    createSection(context) {
        const elements = [];
        // const mediaExchange = templateBuilderService.createMediaExchange(context._printData);
        // elements.push(mediaExchange);
        return elements;
    }
};




