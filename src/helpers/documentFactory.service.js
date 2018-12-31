
class DocumentFactory {

    constructor(options) {
        this.rootElement = undefined;
    }

    // create() {
    //     let rootElement = document.implementation.createHTMLDocument();
    //     this.rootElement = rootElement;
    //     return this.rootElement;
    // }

    get(options) {

        if (this.rootElement === undefined) {
            this.rootElement = document.implementation.createHTMLDocument();
        }

        if (options && options.createNew === true) {
            this.rootElement === undefined;
            this.rootElement = document.implementation.createHTMLDocument();
        }

        return this.rootElement;
    }
}

module.exports = new DocumentFactory();