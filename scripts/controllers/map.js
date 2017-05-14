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

    var map, svg, g, tip;
    var districtPolygons, choosenPolygon, colorToAssign, neighborhoodPolygons;


    function projectPoint(x, y) {
      var point = map.latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);

    }

    var clearPaintedPaths = function(){
      d3.selectAll("path").remove();
    }

    var changeDistrictPolygonColors = function(optionIdx){


      console.log("Changing category colors for districts with optionIdx: ", optionIdx);

      districtPolygons.each(function(d, i) {
        // console.log("Polygon: ", d, i);
        choosenPolygon = d3.select("#District_"+d.properties["N_Distri"]);

        colorToAssign = "white";
        choosenPolygon
          .style("opacity", 0.2)
          .style("stroke", "white")
          .style("stroke-width", "2")
          .style("fill", colorToAssign);

      });
    };


    var paintDistrictsOverMap = function(){

      d3.json("datasets/divisiones_administrativas/districtes/districtes_geo.json", function (error, geojson) {


          // console.log("Extracted data: ", geojson);
          var transform = d3.geo.transform({point: projectPoint}),
            path = d3.geo.path().projection(transform);

          var feature = g.selectAll("path")
            .data(geojson.features)
            .enter()
            .append("path")
            .attr("id", function (d) {

              return "District_" + d.properties["Distri"];
            })
            .style("stroke", "black")
            .style("stroke-width", "1")
            .style("fill", function(d,i) { return "blue"; } )
            .style("opacity", 0.8);

          feature.call(tip);

          feature.on('mouseover', tip.show)
            .on('mouseout', tip.hide);

          neighborhoodPolygons = feature;


          map.on("viewreset", reset);
          reset();

          // Reposition the SVG to cover the features.
          function reset() {
            var bounds = path.bounds(geojson),
              topLeft = bounds[0],
              bottomRight = bounds[1];

            svg.attr("width", bottomRight[0] - topLeft[0])
              .attr("height", bottomRight[1] - topLeft[1])
              .style("left", topLeft[0] + "px")
              .style("top", (topLeft[1]) + "px");

            g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

            g.selectAll("path").attr("d", path);
          }

        });
    }
    var paintNeighborhoodOverMap = function(){

      d3.json("datasets/divisiones_administrativas/barris/barris_geo.json", function (error, geojson) {


        // console.log("Extracted data: ", geojson);
        var transform = d3.geo.transform({point: projectPoint}),
          path = d3.geo.path().projection(transform);

        var feature = g.selectAll("path")
          .data(geojson.features)
          .enter()
          .append("path")
          .attr("id", function (d) {


            return "Barri_" + d.properties["N_Barri"];
          })
          .style("stroke", "black")
          .style("stroke-width", "1")
          .style("fill", function(d,i) { return"red"; } )
          .style("opacity", 0.8);
        feature.call(tip);

        feature.on('mouseover', tip.show)
          .on('mouseout', tip.hide)
        neighborhoodPolygons = feature;


        map.on("viewreset", reset);
        reset();

        // Reposition the SVG to cover the features.
        function reset() {
          var bounds = path.bounds(geojson),
            topLeft = bounds[0],
            bottomRight = bounds[1];

          svg.attr("width", bottomRight[0] - topLeft[0])
            .attr("height", bottomRight[1] - topLeft[1])
            .style("left", topLeft[0] + "px")
            .style("top", (topLeft[1]) + "px");

          g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

          g.selectAll("path").attr("d", path);
        }

      });
    }
    var paintAEBsOverMap = function(){

      d3.json("datasets/divisiones_administrativas/area-estadistica/area-estadistica_geo.json", function (error, geojson) {


        // console.log("Extracted data: ", geojson);
        var transform = d3.geo.transform({point: projectPoint}),
          path = d3.geo.path().projection(transform);

        var feature = g.selectAll("path")
          .data(geojson.features)
          .enter()
          .append("path")
          .attr("id", function (d) {

            console.log("D: ", d);
            return "AEB_" + d.properties["C_AEB"];
          })
          .style("stroke", "black")
          .style("stroke-width", "1")
          .style("fill", function(d,i) { return"green"; } )
          .style("opacity", 0.8);
        feature.call(tip);

        feature.on('mouseover', tip.show)
          .on('mouseout', tip.hide)
        neighborhoodPolygons = feature;


        map.on("viewreset", reset);
        reset();

        // Reposition the SVG to cover the features.
        function reset() {
          var bounds = path.bounds(geojson),
            topLeft = bounds[0],
            bottomRight = bounds[1];

          svg.attr("width", bottomRight[0] - topLeft[0])
            .attr("height", bottomRight[1] - topLeft[1])
            .style("left", topLeft[0] + "px")
            .style("top", (topLeft[1]) + "px");

          g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

          g.selectAll("path").attr("d", path);
        }

      });
    }



    var createMap = function() {


      var width = screen.width * 1;
      var height = screen.height * 0.83;


      $("#map").css("width", width + "px");
      $("#map").css("height", height + "px");
      $("#map").css("margin-left", screen.width * 0.02 + "px");


      var legendHeight = screen.height * 0.35;

      map = new L.Map("map", {center: [41.387034, 2.170020], zoom: 13});

      // map.addLayer(new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"));
      // L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
      L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
        maxZoom: 18, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
      }).addTo(map);

      map.options.maxZoom = 14;
      map.options.minZoom = 12;


      svg = d3.select(map.getPanes().overlayPane)
        .append("svg");

      svg.attr('width', width)
        .attr('height', height)
        .attr("class", "clickable");

      g = svg.append("g")
        .attr("class", "leaflet-zoom-hide")
        .style("z-index", 9);
      var result;

      tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
          var result = "<p><strong>District: </strong>"+d.properties['N_Distri']+"</p>";
          if(d.properties.hasOwnProperty("N_Barri")){
            result += "<p></p><strong>Neighborhood: </strong>"+d.properties['N_Barri']+"</p>";
          }
          if(d.properties.hasOwnProperty("C_AEB")){
            result += "<p></p><strong>AEB: </strong>"+d.properties['C_AEB']+"</p>";
          }


          return result;
        });

      paintNeighborhoodOverMap();




        map.on('zoomend', function() {
          console.log("ZOOM: ", map.getZoom());
          switch(map.getZoom()) {
            case 12:
              clearPaintedPaths();
              paintDistrictsOverMap();
              break;
            case 13:
              clearPaintedPaths();
              paintNeighborhoodOverMap();
              break;
            case 14:
              clearPaintedPaths();
              paintAEBsOverMap();
              break;
            default:
              clearPaintedPaths();
              paintNeighborhoodOverMap();
          }
        });
      };





      createMap();
    });
