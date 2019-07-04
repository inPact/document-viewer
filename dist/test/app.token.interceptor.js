angular.module('app')
    .factory('TokenInterceptor', function ($q, $window, $injector) {

        return {
            request: function (config) {


                //let currentAccessToken = "pMnno4WRRY345cQXGJJtWLqVvZio4k6U";
                let currentAccessToken = window.localStorage.getItem('accessToken');

                config.headers.Authorization = 'Bearer ' + currentAccessToken;

                config.headers['ros-organization'] = '56e92e0ba33e1c030054a5ec';

                return config;
            }
        };
    });