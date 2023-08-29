import './css/tlogDocsTemplate.scss';
import TlogDocsService from './tlog-docs-template/tlogDocsService';

window.DocumentViewer = class DocumentViewer {
    constructor(options = {}) {


        console.log('DocumentViewer version : ' + VERSION);
        console.log('DocumentViewer options : ' , options);

        options.locale = options.locale || 'he-IL';
        options.realRegion = options.realRegion || 'il';

        this._tlogDocsService = new TlogDocsService(options);
    }

    getDocumentsInfoFromTlog(tlog, options) {
        return this._tlogDocsService.getDocs(tlog, options);
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
