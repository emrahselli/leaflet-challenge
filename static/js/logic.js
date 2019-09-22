// Link to geoJSON
var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson"

var tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Grab data with D3
d3.json(earthquakeURL, function(data) {
  // Send data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {


  // Give each feature a popup describing the place, time and magnitude of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
      "</h3><hr><p>Magnitude: " + feature.properties.mag + "</p>");
  }

  

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      var color;
      var r = 255;
      var g = Math.floor(255-80*feature.properties.mag);
      var b = Math.floor(255-80*feature.properties.mag);
      color= "rgb("+r+" ,"+g+","+b+")"
      
      var geojsonMarkerOptions = {
        radius: 4*feature.properties.mag,
        fillColor: color,
        color: "black",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.6
      };
      return L.circleMarker(latlng, geojsonMarkerOptions);
    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
  
}

function createMap(earthquakes) {

  // Define streetmap, satellite and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiZW1yYWhzZWxsaSIsImEiOiJjazBmeGNtb2EwMW9tM2hwOXYxbzV5ZzRoIn0.E_DSC-uKrri65xEhgfvIWw." +
    "T6YbdDixkOBWH_k9GbS8JQ");

  var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiZW1yYWhzZWxsaSIsImEiOiJjazBmeGNtb2EwMW9tM2hwOXYxbzV5ZzRoIn0.E_DSC-uKrri65xEhgfvIWw." +
    "T6YbdDixkOBWH_k9GbS8JQ");

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiZW1yYWhzZWxsaSIsImEiOiJjazBmeGNtb2EwMW9tM2hwOXYxbzV5ZzRoIn0.E_DSC-uKrri65xEhgfvIWw." +
    "T6YbdDixkOBWH_k9GbS8JQ");

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Satellite": satellite,
    "Dark Map": darkmap
  };

  // Creat a layer for the tectonic plates
  var tectonicPlates = new L.LayerGroup();

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
    };

  // Create our map, giving it the streetmap, earthquakes and tectonic plate layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes, tectonicPlates]
  });


  function getColor(d) {
    return d < 3  ? 'rgb(255,195,195)' :
          d < 4  ? 'rgb(255,165,165)' :
          d < 5  ? 'rgb(255,135,135)' :
          d < 6  ? 'rgb(255,105,105)' :
          d < 7  ? 'rgb(255,75,75)' :
          d < 8  ? 'rgb(255,45,45)' :
          d < 9  ? 'rgb(255,15,15)' :
                      'rgb(255,0,0)';
}

  // Add Fault lines data
  d3.json(tectonicPlatesURL, function(plateData) {
    // Adding our geoJSON data, along with style information, to the tectonicplates layer.
    L.geoJson(plateData, {
      color: "blue",
      weight: 2
    })
    .addTo(tectonicPlates);
});


  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Create a legend to display information about our map
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {
  
      var div = L.DomUtil.create('div', 'info legend'),
      grades = [2, 3, 4, 5, 6, 7, 8],
      labels = [];

      div.innerHTML+='Magnitude<br><hr>'
  
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }
  
  return div;
  };
  
  legend.addTo(myMap);

}