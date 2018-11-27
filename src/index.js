import './css/tlogDocsTemplate.scss';
import TlogDocsService from './tlog-docs-template/tlogDocsService';

class DocumentViewer {
    constructor() {
        this._tlogDocsService = new TlogDocsService({
            isUS: false,
            local: 'he-IL'
        });
    }

    getDocumentsInfoFromTlog(tlog, printData) {
        return this._tlogDocsService.getDocs(tlog, printData);
    }

    getHTMLDocument(documentInfo, printData) {
        return this._tlogDocsService.getHTMLDocument(documentInfo, printData);
    }

    getHTMLDocumentWithoutTlog(document, options) {
        return this._tlogDocsService.getHTMLDocumentWithoutTlog(document, options);
    }
}

if(module) {
    module.exports = DocumentViewer;
} else {
    window.DocumentViewer = DocumentViewer;
}
