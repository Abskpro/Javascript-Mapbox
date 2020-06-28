var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

function success(pos) {
  var crd = pos.coords;
  CreateMap(crd.longitude, crd.latitude);
  console.log('Your current position is:');
  console.log(`Latitude : ${crd.latitude}`);
  console.log(`Longitude: ${crd.longitude}`);
  console.log(`More or less ${crd.accuracy} meters.`);
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error, options);

function CreateMap(long, lat) {
  var geojson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          message: 'Foo',
          iconSize: [60, 60],
          description:
            '<strong>I have a lot of blood my blood is literrally leaking </strong>',
        },
        geometry: {
          type: 'Point',
          coordinates: [85.32470026816429, 27.791778593210523],
        },
      },
    ],
  };

  ////////// this for the displaying the map on the screeen ///////////////////////
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYWJzazEyMzQiLCJhIjoiY2s3Z3Z3azB6MDQyNzNmbzkxd3MwN3hnNyJ9.-paJt9fSR1rw0Wq0LwSmig';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [long, lat], //starting position
    zoom: 15, //starting zomm
  });

  var directions = new MapboxDirections({
    accessToken:
      'pk.eyJ1IjoiYWJzazEyMzQiLCJhIjoiY2s3Z3Z3azB6MDQyNzNmbzkxd3MwN3hnNyJ9.-paJt9fSR1rw0Wq0LwSmig',
    unit: 'metric',
    profile: 'mapbox/cycling',
  });

  // add geolocate control to the map
  // map.addControl(
  //   new mapboxgl.GeolocateControl({
  //     positionOptions: {
  //       enableHighAccuracy: true,
  //     },
  //     trackUserLocation: true,
  //   }),
  // );

  //geocoder for searching place on the map
  map.addControl(
    new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
    }),
  );

  var geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
  });
  map.addControl(geolocate);

  //get user longitude and latitude
  map.on('click', function (e) {
    console.log(JSON.stringify(e.lngLat.wrap()));
  });

  //for each json file map data
  geojson.features.forEach(function (marker) {
    var el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundImage =
      'url(https://placekitten.com/g/' +
      marker.properties.iconSize.join('/') +
      '/)';
    el.style.width = marker.properties.iconSize[0] + 'px';
    el.style.height = marker.properties.iconSize[1] + 'px';

    el.addEventListener('click', function () {
      var coordinates = marker.geometry.coordinates.slice();
      var description = marker.properties.description;

      var popup = new mapboxgl.Popup({offset: 25}).setText(description);
      el.id = 'marker';
      //create the marker
      console.log(coordinates, description);
      new mapboxgl.Marker(el).setLngLat(coordinates).setPopup(popup).addTo(map);
    });

    //add marker to map
    new mapboxgl.Marker(el).setLngLat(marker.geometry.coordinates).addTo(map);
  });

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // initialize the map canvas to interact with later
  var canvas = map.getCanvasContainer();

  // an arbitrary start will always be the same
  // only the end or destination will change
  var start = [85.31403841953056, 27.70549515573589];

  // create a function to make a directions request
  function getRoute(end) {
    // make directions request using cycling profile
    var url =
      'https://api.mapbox.com/directions/v5/mapbox/cycling/' +
      start[0] +
      ',' +
      start[1] +
      ';' +
      end[0] +
      ',' +
      end[1] +
      '?steps=true&geometries=geojson&access_token=' +
      mapboxgl.accessToken;

    // make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onload = function () {
      var json = JSON.parse(req.response);
      var data = json.routes[0];
      var route = data.geometry.coordinates;
      var geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route,
        },
      };
      // if the route already exists on the map, we'll reset it using setData
      if (map.getSource('route')) {
        map.getSource('route').setData(geojson);
      }
      // otherwise, we'll make a new request
      else {
        map.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: geojson,
              },
            },
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75,
          },
        });
      }

      // get the sidebar and add the instructions
      var instructions = document.getElementById('instructions');
      var steps = data.legs[0].steps;

      var tripInstructions = [];
      for (var i = 0; i < steps.length; i++) {
        tripInstructions.push('<br><li>' + steps[i].maneuver.instruction) +
          '</li>';
        instructions.innerHTML =
          '<br><span class="duration">Trip duration: ' +
          Math.floor(data.duration / 60) +
          ' min 🚴 </span>' +
          tripInstructions;
      }
    };
    req.send();
  }

  map.on('load', function () {
    // make an initial directions request that
    // starts and ends at the same location
    getRoute(start);
    // Add destination to the map
    map.addLayer({
      id: 'point',
      type: 'circle',
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: start,
              },
            },
          ],
        },
      },
      paint: {
        'circle-radius': 10,
        'circle-color': '#3887be',
      },
    });

    geolocate.on('geolocate', function () {
      getRoute([long, lat]);
    });
    // allow the user to click the map to change the destination
    // map.on('click', function (e) {
    //   var coordsObj = e.lngLat;
    //   canvas.style.cursor = '';
    //   var coords = Object.keys(coordsObj).map(function (key) {
    //     return coordsObj[key];
    //   });
    //   var end = {
    //     type: 'FeatureCollection',
    //     features: [
    //       {
    //         type: 'Feature',
    //         properties: {},
    //         geometry: {
    //           type: 'Point',
    //           coordinates: coords,
    //         },
    //       },
    //     ],
    //   };
    //   if (map.getLayer('end')) {
    //     map.getSource('end').setData(end);
    //   } else {
    //     map.addLayer({
    //       id: 'end',
    //       type: 'circle',
    //       source: {
    //         type: 'geojson',
    //         data: {
    //           type: 'FeatureCollection',
    //           features: [
    //             {
    //               type: 'Feature',
    //               properties: {},
    //               geometry: {
    //                 type: 'Point',
    //                 coordinates: coords,
    //               },
    //             },
    //           ],
    //         },
    //       },
    //       paint: {
    //         'circle-radius': 5,
    //         'circle-color': '#f30',
    //       },
    //     });
    //   }
    // });
  });

  // add to your mapboxgl map
}

// window.onload = function () {
//   getLocation();
// };
