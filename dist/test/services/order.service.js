"use strict";

angular.module('app')
    .constant("ENV", {
        // ep: 'https://ros-rp.tabit.cloud',
        // ep: 'https://il-int-ros.tabit-stage.com',
        ep: 'https://us-int-ros.tabit-stage.com',
        org: '5ff33bcd0f28b4395871c3d0',
        // tlog: '635faf293a10217a6d005fba', //zohar -- with refund
        tlog: '637b3cbd8882ac8e11609f71',
        // locale: 'he-IL',
        locale: 'en-US',
        // realRegion: 'IL',
        realRegion: 'US',
        // realRegion: 'GR',
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
            return $http.get(`${EP}/${URL}/${id}`).then(x => x.data);
        }

        function getBillPrintData(id, options) {
            let URL = options.status === 'closed' ? TLOGS_URL : ORDERS_URL;

            if (options.status === 'closed') {
                return $http.get(`${EP}/${URL}/${id}/bill`).then(x => x.data[0]);
            } else {
                return $http.get(`${EP}/${URL}/${id}/printdata/orderbill`).then(x => x.data[0]);
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
