"use strict";

angular.module('app')
    .constant("ENV", {
        // ep: 'https://ros-rp.tabit.cloud',
        ep: 'https://il-int-ros.tabit-stage.com',
        org: '600990d0a1dd7905d4f00cf9',
        tlog: '60bdc1e77e30a35dcec5b26a',
        locale: 'he-IL',
        //locale: 'en-US',
        username: 'admin@tabit.cloud',
        pass: 'tabitros',
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
