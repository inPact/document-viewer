
import DocumentFactory from '../helpers/documentFactory.service';

export default class HtmlCreator {

    constructor(options) {
        this.$documentFactory = new DocumentFactory();
    }

    createSection(options) {

        let doc = this.$documentFactory.get();

        let classList = options.classList;
        let id = options.id;

        let elementSection = doc.createElement('div');

        elementSection.id = id;

        elementSection.classList.add('section-element');

        classList.forEach(c => {
            elementSection.classList.add(c);
        });

        return elementSection;
    }

    create(doc, options) {

        let type = options.type;
        let id = options.id;
        let classList = options.classList;
        let value = options.value;

        let element = doc.createElement(type);

        element.id = id;

        classList.forEach(c => {
            element.classList.add(c);
        });

        element.innerHTML = value;

        return element;
    }

}