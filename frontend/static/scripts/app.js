'use strict';

/**
 * @ngdoc overview
 * @name visualMinersApp
 * @description
 * # visualMinersApp
 *
 * Main module of the application.
 */
angular
  .module('visualMinersApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'duScroll'
  ])
  .config(function ($routeProvider,$locationProvider) {
    $locationProvider.hashPrefix('');
    $routeProvider
      // .when('/', {
      //   templateUrl: 'static/views/main.html',
      //   controller: 'MainCtrl',
      //   controllerAs: 'main'
      // })

      .when('/map', {
        templateUrl: 'static/views/map.html',
        controller: 'MapCtrl',
        controllerAs: 'map'
      })

      .when('/about', {
        templateUrl: 'static/views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })


      .otherwise({
        redirectTo: '/map'
      });
  });
