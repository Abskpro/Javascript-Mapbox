function CreateMap() {
  var geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          message: "Foo",
          iconSize: [60, 60],
          description: "<strong>I have a lot of blood my blood is literrally leaking </strong>"
        },
        geometry: {
          type: "Point",
          coordinates: [85.31627614368, 27.680612400356125]
        }
      }
    ]
  };

  ////////// this for the displaying the map on the screeen ///////////////////////
  mapboxgl.accessToken = "pk.eyJ1IjoiYWJzazEyMzQiLCJhIjoiY2s3Z3Z3azB6MDQyNzNmbzkxd3MwN3hnNyJ9.-paJt9fSR1rw0Wq0LwSmig";
  var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: [27.712, 85.324], //starting position
    zoom: 9 //starting zomm
  });

  //add geolocate control to the map
  map.addControl(
    new mapboxgl.GeolocateControl({
      postionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    })
  );

  //geocoder for searching place on the map
  map.addControl(
    new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl
    })
  );

  //get user longitude and latitude
  map.on("click", function(e) {
    console.log(JSON.stringify(e.lngLat.wrap()));
  });

  //for each json file map data
  geojson.features.forEach(function(marker) {
    var el = document.createElement("div");
    el.className = "marker";
    el.style.backgroundImage = "url(https://placekitten.com/g/" + marker.properties.iconSize.join("/") + "/)";
    el.style.width = marker.properties.iconSize[0] + "px";
    el.style.height = marker.properties.iconSize[1] + "px";

    el.addEventListener("click", function() {
      var coordinates = marker.geometry.coordinates.slice();
      var description = marker.properties.description;

      var popup = new mapboxgl.Popup({ offset: 25 }).setText(description);
      el.id = "marker";
      //create the marker
      console.log(coordinates, description);
      new mapboxgl.Marker(el)
        .setLngLat(coordinates)
        .setPopup(popup)
        .addTo(map);
    });

    //add marker to map
    new mapboxgl.Marker(el).setLngLat(marker.geometry.coordinates).addTo(map);
  });
}

console.log("hello");
window.onload = CreateMap();
