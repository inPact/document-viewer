export default class HtmlCreator {

    constructor(options) {

    }

    createSection(doc) {

        let elementSection = doc.createElement('div');

        elementSection.classList.add('section-element');

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