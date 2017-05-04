'use strict';

/**
 * @ngdoc function
 * @name visualMinersApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the visualMinersApp
 */
angular.module('visualMinersApp')
  .controller('AboutCtrl', function () {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];


    particlesJS.load('particles-js', '/data/particles.json', function() {
      console.log('callback - particles.js config loaded');
    });

  });
