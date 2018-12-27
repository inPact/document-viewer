
import DocumentFactory from '../helpers/documentFactory.service';

export default class HtmlCreator {

    constructor(options) {

    }

    createSection(options) {

        let doc = DocumentFactory.get();

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
        let children = options.children;

        let element = doc.createElement(type);

        element.id = id;

        classList.forEach(c => {
            element.classList.add(c);
        });

        if (value !== undefined)
            element.innerHTML = value;

        if (children && children.length > 0) {

            children.forEach(elementChild => {
                element.appendChild(elementChild);
            });

        }

        return element;
    }

}