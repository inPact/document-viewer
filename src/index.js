import './css/tlogDocsTemplate.scss';
import TlogDocsService from './tlog-docs-template/tlogDocsService';

window.DocumentViewer = class DocumentViewer {
    constructor(options = {}) {
        this._tlogDocsService = new TlogDocsService({
            local: options.locale,
            isUS: options.locale === 'en-US'
        });
    }

    getDocumentsInfoFromTlog(tlog, printData) {
        return this._tlogDocsService.getDocs(tlog, printData);
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