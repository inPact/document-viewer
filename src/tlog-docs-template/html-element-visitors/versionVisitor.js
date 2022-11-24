import HtmlCreator from '../../helpers/htmlCreator.service';

const htmlCreator = new HtmlCreator();

// pkg version (hidden element).
export const VersionVisitor = {
    visit(context) {
        return this.createSection();
    },
    createSection() {
        const elements = [];
        const versionNumber = htmlCreator.create({
            type: 'div',
            id: 'version',
            classList: ['hidden-element'],
            value: VERSION
        });
        elements.push(versionNumber);
        return elements;
    }
};
