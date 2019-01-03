
class DocumentFactory {

    constructor(options) {
        this.rootElement = undefined;
        this.document = undefined;
        this.printData = undefined;
    }

    get(options) {

        if (this.rootElement === undefined) {
            this.rootElement = document.implementation.createHTMLDocument();
        }

        if (options && options.createNew === true) {
            this.rootElement === undefined;
            this.rootElement = document.implementation.createHTMLDocument();
            this.documentInfo = _.get(options, 'documentInfo') || undefined;
            this.printData == _.get(options, 'printData') || undefined;
        }

        return this.rootElement;
    }

    getDocumentInfo() {
        return this.documentInfo;
    }

    getPrintData() {
        return this.printData;
    }

}

module.exports = new DocumentFactory();