import './css/tlogDocsTemplate.scss';
import TlogDocsService from './tlog-docs-template/tlogDocsService';

window.DocumentViewer = class DocumentViewer {
    constructor() {
        this._tlogDocsService = new TlogDocsService({isUS: false, local: 'he-IL'});
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