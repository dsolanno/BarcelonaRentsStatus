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

    $scope.currentDate = -1;

    $scope.STATE_STOP=1;
    $scope.STATE_PLAY=2;
    $scope.STATE_PAUSE=3;
    $scope.STATE_RESUME=4;

    $scope.time_slider_state = $scope.STATE_STOP;
    $scope.time_interval;
    $scope.totalListings =667;

    var original_listings_dataset = [];

    var MONTHS_INTERVAL_STEP = 12;
    var timeSliderDelay = 1000;


    var map, svg, g, tip;
    var districtPolygons, choosenPolygon, colorToAssign, neighborhoodPolygons;
    var MercatorXofLongitude, MercatorYofLatitude, cscale, data;


    const LISTING_HOVERED = "orange";

    const USE_DISTRICTS_GRANULARITY = 0;
    const USE_NEIGHBORHOODS_GRANULARITY = 1;


    $scope.granularitySelected = USE_DISTRICTS_GRANULARITY;


    function projectPoint(x, y) {
      var point = map.latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);

    }

    var clearPaintedPaths = function(){
      d3.selectAll(".polygon").remove();
    };

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

    var paintAibnbListings = function(){


      //-------------------------------------------------------------------------------------
      MercatorXofLongitude = function (lon) {
        return lon * 20037508.34 / 180;
      }

      MercatorYofLatitude = function (lat) {
        return (Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180)) * 20037508.34 / 180;
      }
      cscale = d3.scale.linear().domain([1, 3]).range(['#ffffb2','#fed976','#feb24c','#fd8d3c','#f03b20','#bd0026']);//["#ff0000", "#ff6a00", "#ffd800", "#b6ff00", "#00ffff", "#0094ff"]);//"#00FF00","#FFA500"


      var leafletMap = map;
      //d3.csv('datasets/airbnb/listings.csv', function (error, listings) {
      d3.dsv('|')('datasets/airbnb/listings_host_until.csv', function (error, listings) {


        $scope.maxDate = new Date(d3.entries(listings)
        // sort by value descending
          .sort(function(a, b) { return d3.descending(new Date(a.host_until), new Date(b.host_until))})
          // take the first option
          [0].value.host_until);

        $scope.minDate = new Date(d3.entries(listings)
        // sort by value descending
          .sort(function(a, b) { return d3.ascending(new Date(a.first_review), new Date(b.first_review)) })
          // take the first option
          [0].value.first_review);

        console.log("MAx date: ", $scope.maxDate);
        console.log("Min date: ", $scope.minDate);

        $scope.currentDate = $scope.minDate;





        $scope.buttonPlayPressed = function () {

          console.log("PLAY");

          if ($scope.time_slider_state == $scope.STATE_STOP) {
            $scope.time_slider_state = $scope.STATE_PLAY;
            $scope.time_interval = setInterval(function () {
              // var val = $('#time_slider').slider("getValue");
              // $("#time_slider").slider("setValue", val + 1, true, true);

              var tmpDate = new Date($scope.currentDate.getTime());
              tmpDate.setMonth(tmpDate.getMonth() + MONTHS_INTERVAL_STEP);

              if(tmpDate.getTime() > $scope.maxDate.getTime()){
                $scope.currentDate = $scope.maxDate;
              }else{
                $scope.currentDate.setMonth($scope.currentDate.getMonth()+MONTHS_INTERVAL_STEP);
              }

              calculateAndPaintPointsOnMap();

              if (!$scope.$$phase) $scope.$apply();

            }, timeSliderDelay)
          }
          else if ($scope.time_slider_state == $scope.STATE_PLAY || $scope.time_slider_state == $scope.STATE_RESUME) {
            $scope.time_slider_state = $scope.STATE_PAUSE;
            clearInterval($scope.time_interval);
          }
          else if ($scope.time_slider_state == $scope.STATE_PAUSE) {
            $scope.time_slider_state = $scope.STATE_RESUME;
            $scope.time_interval = setInterval(function () {
              // var val = $('#time_slider').slider("getValue");
              // $("#time_slider").slider("setValue", val + 1, true, true);

              var tmpDate = new Date($scope.currentDate.getTime());
              tmpDate.setMonth(tmpDate.getMonth() + MONTHS_INTERVAL_STEP);

              if(tmpDate.getTime() > $scope.maxDate.getTime()){
                $scope.currentDate = $scope.maxDate;
              }else{
                $scope.currentDate.setMonth($scope.currentDate.getMonth()+MONTHS_INTERVAL_STEP);
              }

              calculateAndPaintPointsOnMap();

              if (!$scope.$$phase) $scope.$apply();

            }, timeSliderDelay)
          }
        };

        $scope.buttonNextPressed = function(){

          console.log("NEXT");

          $scope.time_slider_state = $scope.STATE_PAUSE;
          // var val = $('#time_slider').slider("getValue");
          // $("#time_slider").slider("setValue", val + 1, true, true);
          var tmpDate = new Date($scope.currentDate.getTime());
          tmpDate.setMonth(tmpDate.getMonth() + MONTHS_INTERVAL_STEP)
          if(tmpDate.getTime() > $scope.maxDate.getTime()){
            $scope.currentDate = $scope.maxDate;
          }else{
            $scope.currentDate.setMonth($scope.currentDate.getMonth()+MONTHS_INTERVAL_STEP);
          }
          clearInterval($scope.time_interval);
          if (!$scope.$$phase) $scope.$apply();
          calculateAndPaintPointsOnMap();

        };
        $scope.buttonBackPressed = function(){

          console.log("BACK");

          $scope.time_slider_state = $scope.STATE_PAUSE;
         /* var val = $('#time_slider').slider("getValue");
          $("#time_slider").slider("setValue", val - 1, true, true);*/

         var tmpDate = new Date($scope.currentDate.getTime());
          tmpDate.setMonth(tmpDate.getMonth()-MONTHS_INTERVAL_STEP);

          if(tmpDate.getTime() < $scope.minDate.getTime()){
            $scope.currentDate = new Date($scope.minDate.getTime());
            if (!$scope.$$phase) $scope.$apply();
          }else{
            $scope.currentDate.setMonth($scope.currentDate.getMonth()-MONTHS_INTERVAL_STEP);
            if (!$scope.$$phase) $scope.$apply();
          }
          clearInterval($scope.time_interval);

          if (!$scope.$$phase) $scope.$apply();

          calculateAndPaintPointsOnMap();



        };

        $scope.buttonStopPressed = function () {
          console.log("STOP");

          $scope.time_slider_state = $scope.STATE_STOP;
          clearInterval($scope.time_interval);

          $scope.currentDate = new Date($scope.minDate.getTime());
          if (!$scope.$$phase) $scope.$apply();
          calculateAndPaintPointsOnMap();

          // var e = {
          //   value : {
          //     newValue: $scope.relativeStartingTs
          //   }
          // };
          // // $scope.timeChangedListener(e);
          // // $scope.updateCurrentTimestamp(e.value.newValue );

          // $("#time_slider").slider("setValue",  0, true, true);
        };

        if (!$scope.$$phase) $scope.$apply();

        function reformat(array) {
          data = [];
          array.map(function (d, i) {

            data.push({
              id: i,
              type: "Feature",
              airbnb_data: d,
              geometry: {
                coordinates: [+d.longitude, +d.latitude],
                type: "Point"
              }


            });
          });
          return data;
        }


        var geoData = {type: "FeatureCollection", features: reformat(listings)};
        console.log("geoData: ", geoData);

        original_listings_dataset = geoData;



        var qtree = d3.geom.quadtree(geoData.features.map(function (data, i) {
            return {
              x: data.geometry.coordinates[0],
              y: data.geometry.coordinates[1],
              all: data
            };
          }
          )
        );


        // Find the nodes within the specified rectangle.
        function search(quadtree, x0, y0, x3, y3) {
          var pts = [];
          var subPixel = false;
          var subPts = [];
          var scale = getZoomScale();
          console.log(" scale: " + scale);
          var counter = 0;
          quadtree.visit(function (node, x1, y1, x2, y2) {
            var p = node.point;
            var pwidth = node.width * scale;
            var pheight = node.height * scale;

            // -- if this is too small rectangle only count the branch and set opacity
            if ((pwidth * pheight) <= 1) {
              // start collecting sub Pixel points
              subPixel = true;
            }
            // -- jumped to super node large than 1 pixel
            else {
              // end collecting sub Pixel points
              if (subPixel && subPts && subPts.length > 0) {

                subPts[0].group = subPts.length;
                pts.push(subPts[0]); // todo calculate intensity
                counter += subPts.length - 1;
                subPts = [];
              }
              subPixel = false;
            }

            if ((p) && (p.x >= x0) && (p.x < x3) && (p.y >= y0) && (p.y < y3)) {

              if (subPixel) {
                subPts.push(p.all);
              }
              else {
                if (p.all.group) {
                  delete (p.all.group);
                }
                pts.push(p.all);
              }

            }
            // if quad rect is outside of the search rect do nto search in sub nodes (returns true)
            return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
          });
          console.log(" Number of removed  points: " + counter);
          return pts;

        }


        function updateNodes(quadtree) {
          var nodes = [];
          quadtree.depth = 0; // root

          quadtree.visit(function (node, x1, y1, x2, y2) {
            var nodeRect = {
              left: MercatorXofLongitude(x1),
              right: MercatorXofLongitude(x2),
              bottom: MercatorYofLatitude(y1),
              top: MercatorYofLatitude(y2),
            }

            //console.log("nodeRect: ", nodeRect);
            node.width = (nodeRect.right - nodeRect.left);
            node.height = (nodeRect.top - nodeRect.bottom);

            if (node.depth == 0) {
              console.log(" width: " + node.width + "height: " + node.height);
            }
            nodes.push(node);
            for (var i = 0; i < 4; i++) {
              if (node.nodes[i]) node.nodes[i].depth = node.depth + 1;
            }
          });
          return nodes;
        }

        // Use Leaflet to implement a D3 geometric transformation.
        function projectPoint(x, y) {
          var point = leafletMap.latLngToLayerPoint(new L.LatLng(y, x));
          this.stream.point(point.x, point.y);
        }

        var transform = d3.geo.transform({point: projectPoint});
        var airbnbPaths = d3.geo.path().projection(transform);


        updateNodes(qtree);

        leafletMap.on('moveend', function(){
          console.log("Map move");
          mapmove();
        });

        mapmove();


        function getZoomScale() {
          var mapWidth = leafletMap.getSize().x;
          var bounds = leafletMap.getBounds();
          var planarWidth = MercatorXofLongitude(bounds.getEast()) - MercatorXofLongitude(bounds.getWest());
          var zoomScale = mapWidth / planarWidth;
          return zoomScale;

        }

        function redrawSubset(subset) {
          airbnbPaths.pointRadius(3);// * scale);

          var bounds = airbnbPaths.bounds({type: "FeatureCollection", features: subset});
          var topLeft = bounds[0];
          var bottomRight = bounds[1];

          var start = new Date();


          var points = g.selectAll(".point")
            .data(subset, function (d) {
              return d.id;
            });

          console.log("Redraw.Subset -->  ", subset);
          console.log("Redraw.Points -->  ", points);

          points.enter().append("path");
          points.exit().remove();
          points.attr("d", airbnbPaths);
          points.attr("class","point");
          points.style("fill", "ffd800");
          points.style("fill-opacity", function (d) {
            if (d.group) {
              return (d.group * 0.1) + 0.2;
            }
          });


          points.call(tip);

          points.on('mouseover', function(d, i){

            if( $scope.granularitySelected == USE_NEIGHBORHOODS_GRANULARITY) {
              d3.selectAll(".point")[0].forEach(function (tmp, i) {

                if (tmp.__data__.airbnb_data.neighbourhood == d.airbnb_data.neighbourhood) {

                  tmp = d3.select(tmp);
                  tmp.style('opacity', '1');
                  tmp.style("fill", LISTING_HOVERED);

                }
              });
            }
            else  if( $scope.granularitySelected == USE_DISTRICTS_GRANULARITY) {
              d3.selectAll(".point")[0].forEach(function (tmp, i) {


                if (tmp.__data__.airbnb_data.neighbourhood_group == d.airbnb_data.neighbourhood_group) {
                  tmp = d3.select(tmp);
                  tmp.style('opacity', '1');
                  tmp.style("fill", LISTING_HOVERED);
                }
              });
            }

            tip.show(d);


          });
          points.on('mouseout', function(d){

            tip.hide(d);
            if( $scope.granularitySelected == USE_NEIGHBORHOODS_GRANULARITY) {
              d3.selectAll(".point")[0].forEach(function (tmp, i) {
                // console.log("TMP: ", tmp);
                if (tmp.__data__.airbnb_data.neighbourhood == d.airbnb_data.neighbourhood) {
                  tmp = d3.select(tmp);
                  tmp.style("fill", "ffd800");
                }


              })
            }else if($scope.granularitySelected == USE_DISTRICTS_GRANULARITY) {
              d3.selectAll(".point")[0].forEach(function (tmp, i) {
                // console.log("TMP: ", tmp);
                if (tmp.__data__.airbnb_data.neighbourhood_group == d.airbnb_data.neighbourhood_group) {
                  tmp = d3.select(tmp);
                  tmp.style("fill", "ffd800");
                }


              })
            }

          });



          console.log("updated at  " + new Date().setTime(new Date().getTime() - start.getTime()) + " ms ");

        }

        function calculateAndPaintPointsOnMap (){
          var mapBounds = leafletMap.getBounds();

          var tmpGeoData= {
            features : geoData.features.filter(function(airbnb_listing){

             return ((new Date(airbnb_listing.airbnb_data.host_until).getTime() >= $scope.currentDate.getTime()) && (new Date(airbnb_listing.airbnb_data.first_review).getTime() <= $scope.currentDate.getTime()))
            })
          };

          $scope.totalListings = tmpGeoData.features.length;
          if (!$scope.$$phase) $scope.$apply();

          console.log("Filtered data: ", tmpGeoData.features.length);

          qtree = d3.geom.quadtree(tmpGeoData.features.map(function (data, i) {
              return {
                x: data.geometry.coordinates[0],
                y: data.geometry.coordinates[1],
                all: data
              };
            }
            )
          );

          var subset = search(qtree, mapBounds.getWest(), mapBounds.getSouth(), mapBounds.getEast(), mapBounds.getNorth());
          console.log("subset: " + subset.length);

          redrawSubset(subset);
        }

        function mapmove(e) {
          calculateAndPaintPointsOnMap();

        }
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
          .attr("class", "polygon")
          .style("stroke", "black")
          .style("stroke-width", "1")
          .style("fill", function(d,i) { return "blue"; } )
          .style("opacity", 0.8);

        feature.call(tip);

        feature.on('mouseover', function(d){
          tip.show(d);
          d.style('opacity', '0.7');
        });
        feature.on('mouseout', function(d){
          tip.hide(d);
          d.style('opacity', '0.1');
        });

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
          .attr("class", "polygon")
          .style("stroke", "black")
          .style("stroke-width", "1")
          .style("fill", function(d,i) { return"red"; } )
          .style("opacity", 0.8);
        feature.call(tip);

        feature.on('mouseover', function(d){
          tip.show(d);
          d.style('opacity', '0.7');
        });
        feature.on('mouseout', function(d){
            tip.hide(d);
            d.style('opacity', '0.1');
          });

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
          .attr("class", "polygon")
          .style("stroke", "black")
          .style("stroke-width", "1")
          .style("fill", function(d,i) { return"green"; } )
          .style("opacity", 0.8);
        feature.call(tip);

        feature.on('mouseover', function(d){
          tip.show(d);
          // d.style('opacity', '0.7');


        });
        feature.on('mouseout', function(d){
          tip.hide(d);
          // d.style('opacity', '0.1');
        });
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
    };



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

      map.options.maxZoom = 16;
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
      .direction('e')
        .offset([0, 20])
        .html(function(d) {
          var result = "";

          if(d.hasOwnProperty("properties")) {

            if (d.properties.hasOwnProperty("N_Distri")) {
              console.log("D: ", d);
              result += "<p><strong>District: </strong>" + d.properties['N_Distri'] + "</p>";
            }
            if (d.properties.hasOwnProperty("N_Barri")) {
              result += "<p></p><strong>Neighborhood: </strong>" + d.properties['N_Barri'] + "</p>";
            }
            if (d.properties.hasOwnProperty("C_AEB")) {
              result += "<p></p><strong>AEB: </strong>" + d.properties['C_AEB'] + "</p>";
            }
          }
          if(d.hasOwnProperty("airbnb_data")){
            result += "<p></p><strong>Neighborhood: </strong>" + d.airbnb_data['neighbourhood_group'] + "</p>";


            if( $scope.granularitySelected == USE_NEIGHBORHOODS_GRANULARITY) {

              result += "<p></p><strong>District: </strong>"+d.airbnb_data['neighbourhood']+"</p>";


            }

            // result += "<p></p><strong>Price: </strong>"+d.airbnb_data['price']+"</p>";
            var totalListings = 0;
            var sumPrice = 0;


            console.log("granularitySelected: ", $scope.granularitySelected);
            if( $scope.granularitySelected == USE_NEIGHBORHOODS_GRANULARITY) {


              d3.selectAll(".point")[0].forEach(function (tmp, i) {


                if (tmp.__data__.airbnb_data.neighbourhood == d.airbnb_data.neighbourhood) {
                  // tmp = d3.select(tmp)[0]
                  // console.log("tmp: ", tmp[0].__data__);
                  sumPrice += parseInt(tmp.__data__.airbnb_data.price);
                  totalListings++;

                }
              });
            }
            else if( $scope.granularitySelected == USE_DISTRICTS_GRANULARITY) {
              d3.selectAll(".point")[0].forEach(function (tmp, i) {


                if (tmp.__data__.airbnb_data.neighbourhood_group == d.airbnb_data.neighbourhood_group) {
                  // tmp = d3.select(tmp)[0]
                  // console.log("tmp: ", tmp[0].__data__);
                  sumPrice += parseInt(tmp.__data__.airbnb_data.price);
                  totalListings++;

                }
              });
            }

            result += "<p></p><strong>Zone avg price: </strong>"+(sumPrice/totalListings).toFixed(2)+"</p>";
            result += "<p></p><strong>Zone total listings: </strong>"+totalListings+"</p>";

          }


          return result;
        });

      // paintAibnbListings();



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
            paintAEBsOverMap();
        }
      });

      d3.polygonContains(polygon, point)
    };



    createMap();


    /* Set the width of the side navigation to 250px */
    $scope.openNav = function() {
      document.getElementById("mySidenav").style.width = "250px";
    }

    /* Set the width of the side navigation to 0 */
    $scope.closeNav = function () {
      document.getElementById("mySidenav").style.width = "0";
    }
  });
