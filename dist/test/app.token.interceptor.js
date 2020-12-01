angular.module('app')
    .factory('TokenInterceptor', function (ENV) {

        return {
            request: function (config) {


                //let currentAccessToken = "pMnno4WRRY345cQXGJJtWLqVvZio4k6U";
                let currentAccessToken = window.localStorage.getItem('accessToken');

                config.headers.Authorization = 'Bearer ' + currentAccessToken;

                config.headers['ros-organization'] = ENV.org;

                return config;
            }
        };
    });