'use strict';

angular.module('app')
    .controller('appCtrl', function ($scope, $q, OrderService, CheckService, AuthService, ENV) {

        // USER INPUT.
        let TLOG_ID = ENV.tlog;
        let STATUS = ENV.status || "closed";

        let tlog;


        let appComponent = {
            printData: undefined // print data of the main doc. (set in init func)
        }

        /**
         * for missing data on PrintData Object (in 'invoice', 'deliveryNote')
         * add Server Name and Order Type (from main doc)
         * to selected doc.
         */
        let enrichPrintData = {
            serverName: {},
            billData: {}
        }

        $scope.component = {
            documents: {},
            selectedDocument: undefined
        }

        let documentViewer = new DocumentViewer({
            // isUS: false,
            locale: ENV.locale,
            realRegion: ENV.realRegion,
            timezone: 'America/Chicago'
        });

        /**
         * resolve tlog / order to same struct by status.
         * @param { status : String, data : Object } options (status : 'opened' / 'closed', data : tlog / order object).
         */
        function resolveDataByStatus(options) {

            let status = options.status;
            let data = options.data;

            if (status === 'opened') {
                return {
                    _id: data._id,
                    _type: "tlog",
                    order: [data],
                    number: data.number,
                }
            } else {
                return data;
            }

        }

        /**
         * resovle Customer Signature metadata from the tlog object.
         * find 'P_ID' in tlog.payments (for now only the tlog Object hold the Customer Signature metadata)
         */
        function resolveSignature(printData, tlog) {
            // Since we are in the scope of invoice or delivery-note, we always have only one payment.
            // And therefore we fetch the signature from the first payment.
            // If the signature exists on the print-data - we use it. Otherwise, we fetch it from the tlog.
            
            let signatureFormat = _.get(printData, 'printData.collections.PAYMENT_LIST[0].SIGNATURE_FORMAT');
            let signatureData = _.get(printData, 'printData.collections.PAYMENT_LIST[0].SIGNATURE_DATA');
            if (signatureData) {
                return {
                    format: signatureFormat,
                    data: signatureData,
                };
            }

            let data = resolveDataByStatus({
                status: status,
                data: tlog
            });

            let id = _.get(printData, 'printData.collections.PAYMENT_LIST[0].P_ID');
            let payment = data.order[0].payments.find(c => c._id === id);
            return payment.customerSignature;
        }

        const documentRequestsService = (function () {

            function isDocumentType(type) {
                return (["check", "tlog"].indexOf(type) === -1)
            }

            function isCheckType(type) {
                return (type === "check");
            }

            function create(docs) {

                let isChecksLoaded = false;

                docs.forEach(doc => {

                    $scope.component.documents[doc.id] = {
                        id: doc.id,
                        docType: doc.type,
                        inProgress: true,
                        data: undefined
                    };

                    if (isDocumentType(doc.type)) {

                        if (!doc.isFakeDocument) {
                            OrderService.getPrintData(doc.id, {
                                status: STATUS
                            }).then(printData => {

                                if (printData.length <= 0)
                                    return;

                                let _printData = printData[0];

                                $scope.component.documents[doc.id].inProgress = false;
                                $scope.component.documents[doc.id].data = _printData;

                                if (_printData.documentType === "invoice" || _printData.documentType === "deliveryNote") {
                                    $scope.component.documents[doc.id].signature = resolveSignature(_printData, tlog);
                                }

                            }).catch(err => console.log(err));
                        }

                    } else if (isCheckType(doc.type)) {

                        if (!isChecksLoaded) {

                            isChecksLoaded = true;

                            CheckService.get({
                                id: doc.tlogId,
                                status: doc.status
                            }).then(checks => {

                                checks.forEach(printData => {

                                    let checkNumber = printData.printData.variables.CHECK_NO;
                                    let doc = docs.find(c => c.md && c.md.checkNumber === checkNumber && c.type === "check");

                                    if (doc) {
                                        $scope.component.documents[doc.id].inProgress = false;
                                        $scope.component.documents[doc.id].data = printData;
                                    }

                                });

                            }).catch(err => console.log(err));
                        }

                    }

                });

                if (ENV.realRegion.toLowerCase() === 'au') {
                    docs = docs.filter((doc) => !['creditCard', 'invoice'].includes(doc.type));
                }

                return docs;
            }

            return {

                /**
                 * create document requests to get print data for all the docs.
                 */
                create: (docs) => create(docs)
            }

        })();

        const tplService = (function () {

            function set(tpl) {
                $scope.tpl = tpl;
                let elementTpl = document.getElementById('tpl');
                elementTpl.innerHTML = '';
                elementTpl.appendChild(angular.element(tpl)[0]);
            }

            return {

                /**
                 * set HTML Template (using in this because of problems to show SVG 'viewBox' when we using ng-bind-html).
                 */
                set: set
            }

        })();

        function init() {

            AuthService.authenticate()
                .then(res => {

                    $q.all({
                        printData: OrderService.getBillPrintData(TLOG_ID, { status: STATUS }),
                        data: OrderService.findOne(TLOG_ID, { status: STATUS })
                    }).then(result => {

                        appComponent.printData = result.printData;

                        let data = resolveDataByStatus({ status: STATUS, data: result.data });
                        tlog = data;

                        let docs = documentViewer.getDocumentsInfoFromTlog(data, {});

                        // create doc request from the server.
                        $scope.documentsList = documentRequestsService.create(docs);

                        // set the first doc (bill doc).
                        $scope.component.selectedDocument = $scope.documentsList[0];


                        // PATCH : only the print data of bill return the server name.
                        enrichPrintData.serverName = {
                            F_NAME: appComponent.printData.printData.variables.F_NAME,
                            L_NAME: appComponent.printData.printData.variables.L_NAME
                        }

                        enrichPrintData.billData = {
                            ORDER_BILL_TYPE: appComponent.printData.printData.variables.ORDER_TYPE
                        }

                        appComponent.printData.printData.variables.ORDER_BILL_TYPE = appComponent.printData.printData.variables.ORDER_TYPE;
                        //end PATCH

                        let tpl = documentViewer.getHTMLDocument($scope.component.selectedDocument, appComponent.printData);

                        tplService.set(tpl);

                    });

                });

        }

        $scope.onSelectDocument = function (documentItem) {
            $scope.component.selectedDocument = documentItem;

            if (!$scope.component.documents) {
                return;
            }

            // is Order (Main Bill)
            if (documentItem.isFullOrderBill) {

                //patch
                appComponent.printData.printData.variables.ORDER_BILL_TYPE = enrichPrintData.billData.ORDER_BILL_TYPE;
                //end patch

                let tpl = documentViewer.getHTMLDocument($scope.component.selectedDocument, appComponent.printData);

                tplService.set(tpl);

            } else {

                let selectedDocument = $scope.component.documents[documentItem.id];

                if (!documentItem.tlogId) {
                    return;
                }

                let documentData = {};

                if (['giftCard', 'creditCard', 'clubMembers'].indexOf(selectedDocument.docType) > -1) {

                    documentData.documentType = selectedDocument.docType;
                    documentData.organizationId = selectedDocument.organization;

                    // set the bill print data in case of 'Gift Card' or 'Credit Card' or 'ClubMember'.
                    documentData.printData = {
                        collections: appComponent.printData.printData.collections,
                        variables: appComponent.printData.printData.variables
                    }

                }
                else if (selectedDocument.docType === 'invoice') {
                    documentData = selectedDocument.data; // set print data of 'Invoice'.
                }
                else {
                    documentData = selectedDocument.data;
                }


                if (documentItem.md === undefined) {
                    documentItem.md = {};
                }

                if (!_.isEmpty(documentItem.md.signature)) {

                    let data = documentItem.md.signature;
                    if (_.get(documentItem, 'md.signature.data') === undefined) {
                        documentItem.md.signature = { data: data }
                    }
                } else if (_.get(selectedDocument, 'signature') !== undefined) {
                    documentItem.md.signature = selectedDocument.signature;
                }

                //patch
                documentData.printData.variables.F_NAME = _.get(enrichPrintData.serverName, 'F_NAME')
                documentData.printData.variables.L_NAME = _.get(enrichPrintData.serverName, 'F_NAME')
                documentData.printData.variables.ORDER_BILL_TYPE = enrichPrintData.billData.ORDER_BILL_TYPE;
                //end patch

                let tpl = documentViewer.getHTMLDocument(documentItem, {
                    documentType: documentData.documentType,
                    organizationId: documentData.organizationId,
                    printData: {
                        collections: documentData.printData.collections,
                        variables: documentData.printData.variables
                    }
                });

                tplService.set(tpl);

            }

        }

        init();

    });
