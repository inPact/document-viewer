
"use strict";

angular.module('app')
    .factory('CheckService', function ($http, ENV) {

        let EP = ENV.ep;

        const URL_ORDER = "/orders";
        const URL_TLOGS = "/tlogs";
        const URL_CHECKS = "/checks"
        const URL_SLIPS = "/slips"

        function get(options) {

            let id = options.id;
            let status = options.status;
            console.log('zohar -- status', status)

            if (status === 'closed') {
                console.log('zohar -- status 1', status)
                return $http.get(`${EP}${URL_TLOGS}/${id}${URL_CHECKS}`)
                    .then(result => result.data);
            }
            else {
                console.log('zohar -- status 2', status)
                return $http.get(`${EP}${URL_ORDER}/${id}${URL_CHECKS}${URL_SLIPS}`)
                    .then(result => result.data);;
            }

        }

        return {
            get: get
        }

    });
