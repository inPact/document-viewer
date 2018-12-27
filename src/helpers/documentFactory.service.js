
export default class DocumentFactory {

    constructor(options) {

    }

    create() {
        this.rootElement = document.implementation.createHTMLDocument();
        return this.rootElement;
    }

    get() {
        return this.rootElement;
    }
}