import './css/tlogDocsTemplate.scss';
import TlogDocsService from './tlog-docs-template/tlogDocsService';

window.DocumentViewer = class DocumentViewer {
    constructor(options = {}) {
        options.locale = options.locale || 'he-IL';
        if (options.isUS === undefined)
            options.isUS = options.locale === 'en-US';

        this._tlogDocsService = new TlogDocsService(options);
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

    getDocumentHtml(document, options = {}) {
        return this._tlogDocsService.getHTMLDocumentWithoutTlog(document, options);
    }
};