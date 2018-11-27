import './css/tlogDocsTemplate.scss';
import TlogDocsService from './tlog-docs-template/tlogDocsService';
window.DocumentViewer = class DocumentViewer {

  constructor(options = {}) {
    this.options = {
      isUS: false,
      local: 'he-IL'
    }
    this._tlogDocsService = new TlogDocsService(this.options);
  }



  getDocumentsInfoFromTlog(tlog , printData) {
    return this._tlogDocsService.getDocs(tlog,printData);
  }

  getHTMLDocument(documentInfo, printData) {
    return this._tlogDocsService.getHTMLDocument(documentInfo, printData);
  }

  getHTMLDocumentWithoutTlog(document, options) {
    return this._tlogDocsService.getHTMLDocumentWithoutTlog(document, options);
  }
};

