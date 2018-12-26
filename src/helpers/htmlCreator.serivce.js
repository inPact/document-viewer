export default class HtmlCreator {

    constructor(options) {

    }

    createSection(doc) {

        let elementSection = doc.createElement('div');

        elementSection.classList.add('section-element');

        return elementSection;
    }

}