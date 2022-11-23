class DocumentFactory {
    constructor() {
        this.htmlDocument = undefined;
        this.documentInfo = undefined;
        this.printData = undefined;
    }

    get(options) {
        if (!this.htmlDocument)
            this.htmlDocument = document.implementation.createHTMLDocument();
        
        if (options?.createNew) {
            this.htmlDocument = undefined;
            this.htmlDocument = document.implementation.createHTMLDocument();
            this.documentInfo = _.get(options, 'documentInfo') || undefined;
            this.printData = _.get(options, 'printData') || undefined;
        }

        return this.htmlDocument;
    }

    getDocumentInfo() {
        return this.documentInfo;
    }

    getPrintData() {
        return this.printData.printData;
    }
}

export default new DocumentFactory();
