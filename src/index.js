import './css/tlogDocsTemplate.scss';
import TlogDocsService from './tlog-docs-template/tlogDocsService';

window.DocumentViewer = class DocumentViewer {

    constructor(options = {}) {
        this.initial = false;

        console.log('DocumentViewer version : ' + VERSION);

        if(JSON.stringify(options) === '{}') {
            console.log('error - no option was supplied to DocumentViewer library');
        } else {
            this.initial = true;

            options.locale = options.locale || 'he-IL';
            if (options.isUS === undefined) {
                options.isUS = options.locale === 'en-US';
            }

            this._tlogDocsService = new TlogDocsService(options);
            this.orderViewService = new window.DocumentViewer.OrderViewService(options);
        }
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
        if(this.initial) {
            return this._tlogDocsService.getHTMLDocument(documentInfo, printData);
        } else {
            return {};
        }
    }

    getDocumentHtml(document, options = {}) {
        if(this.initial) {
            return this._tlogDocsService.getHTMLDocumentWithoutTlog(document, options);
        } else {
            return {};
        }
    }

    // get the enrichOrder
    getEnrichOrder(tlog, tables, items, users, promotions, modifierGroups, tlogId, offers) {
        if(this.initial) {
            return this.orderViewService.TimeLine.enrichOrder({tlog, tables, items, users, promotions, modifierGroups, tlogId, offers});
        } else {
            return {};
        }
    }
};
