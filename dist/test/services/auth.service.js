
"use strict";

angular.module('app')
    .factory('AuthService', function ($http, ENV) {

        let EP = ENV.ep;
        let timezone = null;

        const AUTH_URL = '/oauth2/token';
        const _authClientId = 'VbXPFm2RMiq8I2eV7MP4ZQ';

        function authenticate() {
            return $http.post(`${EP}${AUTH_URL}`, {
                grant_type: 'password',
                client_id: _authClientId,
                username: ENV.username,
                password: ENV.pass
            }).then(config => {
                window.localStorage.setItem('accessToken', config.data.access_token);
                return config;
            });
        }

        return {
            authenticate: authenticate,
        }

    });