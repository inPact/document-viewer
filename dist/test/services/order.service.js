"use strict";

angular.module('app')
    .constant("ENV", {
        // ep: 'https://ros-rp.tabit.cloud',
        // ep: 'https://il-int-ros.tabit-stage.com',
        ep: 'https://us-int-ros.tabit-stage.com',
        // ep: 'https://au-int-ros.tabit-stage.com',
        // ep: 'https://il-ros.tabit-stage.com',
        // ep: 'https://us-ros.tabit-stage.com',
        // tlog: '64d1047e38a00042d453ba9b',
        // org: '634669e5988b7f2afebeeeb6',
        org: '66051b8d1f61a42f6231d4e0',
        status: 'opened',
        tlog: '6a4231cdec11d8cfc497f888',
        // tlog: '6a4231cdec11d8cfc497f888',
        // tlog: '6a42281938fc0d9749c41fb7',
        // tlog: '660bb4e497ac6d725ef58e08',
        // locale: 'he-IL',
        locale: 'en-US',
        // locale: 'en-AU',
        // realRegion: 'IL',
        realRegion: 'US',
        // realRegion: 'AU',
        // realRegion: 'GR',
        username: 'integrations-test@tabit.cloud',
        pass: 'Tc123!@#',
        version: '1.66.0',
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
