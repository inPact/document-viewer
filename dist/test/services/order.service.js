"use strict";

angular.module('app')
    .constant("ENV", {
        // ep: 'https://ros-rp.tabit.cloud',
        // ep: 'https://il-int-ros.tabit-stage.com',
        ep: 'https://us-int-ros.tabit-stage.com',
        // ep: 'https://au-ros.tabit-stage.com',
        // org: '64a66b305f56a25a0a4b298f',
        // tlog: '64d1047e38a00042d453ba9b',
        org: '63471db043ec8b9e535b2124',
        tlog: '65918b6dff59800e303b438e',
        // locale: 'he-IL',
        locale: 'en-US',
        // locale: 'en-AU',
        // realRegion: 'IL',
        realRegion: 'US',
        // realRegion: 'AU',
        // realRegion: 'GR',
        // username: 'avishai@tabit.cloud',
        // pass: 'tehilaBen100',
        username: 'integrations-test@tabit.cloud',
        pass: 'Tc123!@#',
        version: '1.34.0',
    })
    .factory('OrderService', function ($http, ENV) {

        let EP = ENV.ep;

        const TLOGS_URL = 'tlogs';
        const ORDERS_URL = 'orders';
        const DOCUMENTS_URL = 'documents/v2';
        const PRINT_DATA = 'printdata';

        function findOne(id, options) {

            let URL = options.status === 'closed' ? TLOGS_URL : ORDERS_URL;

            return $http.get(`${EP}/${URL}/${id}`)
                .then(result => result.data);

        }

        function getBillPrintData(id, options) {

            let URL = options.status === 'closed' ? TLOGS_URL : ORDERS_URL;

            if (options.status === 'closed') {

                return $http.get(`${EP}/${URL}/${id}/bill`)
                    .then(result => result.data[0]);
            } else {
                return $http.get(`${EP}/${URL}/${id}/printdata/orderbill`)
                    .then(result => result.data[0]);
            }


        }

        function getPrintData(id) {
            return $http.get(`${EP}/${DOCUMENTS_URL}/${id}/${PRINT_DATA}`)
                .then(result => result.data);
        }
       

        return {
            findOne: findOne,
            getBillPrintData: getBillPrintData,
            getPrintData: getPrintData
        }


    });
