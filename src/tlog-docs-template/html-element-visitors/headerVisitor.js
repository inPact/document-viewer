import HtmlCreator from '../../helpers/htmlCreator.service';
import HeaderService from '../headerService';
const htmlCreator = new HtmlCreator();
import _ from "lodash";

export const HeaderVisitor = {
    visit(context) {
        if(!_.get(context, 'options.excludeHeader')){
            return this.createSection(context);
        }
    },
    createSection(context){
        const elements = [];
        const logoUrl = _.get(context, 'options.logoUrl');
        if (logoUrl){
           elements.push(this.createLogo(logoUrl));
        }
        elements.push(this.createHeader(context));
        return elements;
    },
    createLogo(logoUrl) {
        const logoImage = htmlCreator.create({
            type: 'img',
            id: 'logo',
            classList: ['logo-image'],
            attributes: [
                { key: 'src', value: logoUrl }
            ]
        });

        const logo = htmlCreator.create({
            type: 'div',
            id: 'container-logo',
            classList: ['flex', 'a-center', 'j-center'],
            children: [
                logoImage
            ]
        });
        return logo;
    },
    createHeader(context){
        const headerService = new HeaderService(context.options);
        const header = headerService.createHeader(context._printData, context._doc, context.docInfo, context._docData);
        header.classList += ' text-center';
        return header;
    }
}
