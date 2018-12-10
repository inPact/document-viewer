import './css/tlogDocsTemplate.scss';
import TlogDocsService from './tlog-docs-template/tlogDocsService';

window.DocumentViewer = class DocumentViewer {
    constructor(options = {}) {
        // options.locale = options.locale || 'he-IL';
        this.options = {
            locale: options.locale,
            isUS: options.isUS
        };

        console.log('this._locale in index before init: ' + this.options.locale)
        console.log(' this._isUS  in index before init:' + this.options.isUS)

        this.options.locale ? this.options.locale : 'en-US';
        this.options.isUS ? this.options.isUS : true;

        console.log('this._locale in index after init: ' + this.options.loacle)
        console.log(' this._isUS  in index after init: ' + this.options.isUS)

        this._tlogDocsService = new TlogDocsService(this.options);
    }

    getDocumentsInfoFromTlog(tlog, printData, isOrderClosed) {
        return this._tlogDocsService.getDocs(tlog, printData, isOrderClosed);
    }

    /**
     * @deprecated - use getDocumentHtml()
     * @param documentInfo
     * @param printData
     * @returns {*}
     */
    getHTMLDocument(documentInfo, printData) {
        return this._tlogDocsService.getHTMLDocument(documentInfo, printData);
    }

    getDocumentHtml(document, options) {
        return this._tlogDocsService.getHTMLDocumentWithoutTlog(document, options);
    }
};