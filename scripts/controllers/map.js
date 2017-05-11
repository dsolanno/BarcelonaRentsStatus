'use strict';

/**
 * @ngdoc function
 * @name visualMinersApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the visualMinersApp
 */
angular.module('visualMinersApp')
  .controller('MapCtrl', function ($scope, $location) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];




    var createMap = function() {


      var width = screen.width * 1;
      var height = screen.height * 0.83;


      $("#map").css("width", width + "px");
      $("#map").css("height", height + "px");
      $("#map").css("margin-left", screen.width * 0.02 + "px");


      var legendHeight = screen.height * 0.35;

      var map = new L.Map("map", {center: [41.387034, 2.170020], zoom: 13});

      // map.addLayer(new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"));
      // L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
      L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
        maxZoom: 18, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
      }).addTo(map);

      map.options.maxZoom = 13;
      map.options.minZoom = 7;


      var svg = d3.select(map.getPanes().overlayPane)
        .append("svg");

      svg.attr('width', width)
        .attr('height', height)
        .attr("class", "clickable");

    };




    createMap();
  });
