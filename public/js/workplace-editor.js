/**
 * This module contains the client-side edit/create functionality for workplace boundaries using Leaflet/OpenStreetMaps
 */

var map = L.map('map', {editable: true}).setView([0, 0], 13);
var editableLayers = new L.FeatureGroup();
map.addLayer(editableLayers);

var polygon;

// Geocoder setup
var geocoder = L.Control.geocoder({defaultMarkGeocode: false}).addTo(map);
geocoder.on('markgeocode', (e) => {
  map.flyTo(e.geocode.center, 16);
});

// Set up the OpenStreetMap layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Data © <a href="http://osm.org/copyright">OpenStreetMap</a>',
  maxZoom: 18
}).addTo(map);


$(document).ready(function () {

  // i.e. A workplace is being edited (and thus the coordinates have been loaded)
  if ($("#boundaries-input").val() != "") {
    
    // Add existing boundary to the map, and enable editing
    var polygon = L.polygon(JSON.parse($('#boundaries-input').val())).addTo(editableLayers);
    polygon.enableEdit();
    map.fitBounds(polygon.getBounds());
    
    
    // Add listener for when points are added to shape, or points are moved 
    polygon.on("editable:vertex:dragend", (e) => {
      processCoords(e.layer._latlngs[0]);
    });

    // Add event listener for when the shape is moved
    polygon.on("editable:dragend", (e) => {
      processCoords(e.layer._latlngs[0]);
    });

  }
  
  // A new workplace is being created
  else {
    // Coords of Australia
    map.setView([-25.274, 133.77], 4.2);
  }

  // Remove the edit functionality provided by Leaflet.Draw,
  // Leaflet.Editable is used instead.
  $('.leaflet-draw-edit-edit').remove();
});

// Disable save button when no boundaries are drawn
map.on('draw:deleted', function (e) {
  $('#saveBtn').attr('disabled', true);
});

// Event triggered after shape has been "finished" (i.e. start connected to finish)
map.on("draw:created", (e) => {

  // Allow the user to only draw one set of boundaries
  if (editableLayers.getLayers().length >= 1) {
    return createFlashMessage("You have already drawn a set of boundaries. Please delete them first.", "danger");
  }

  // The shape that was drawn
  const layer = e.layer;

  // Adding an editable layer retains the drawn shape (visually)
  editableLayers.addLayer(layer);
  
  // Update hidden input field (used by form) to most recently drawn shape
  processCoords(layer._latlngs[0]);

  // Add listener for when points are added or moved
  layer.enableEdit();
  layer.on("editable:vertex:dragend", (e) => {
    processCoords(e.layer._latlngs[0]);
  });

  // Enable save button
  $('#saveBtn').attr('disabled', false);
});
  

// Initalise the 'draw options' tab and add it to the map
map.addControl(new L.Control.Draw({
  // Set options
  position: 'topleft',
  draw: {
    polygon: {
      allowIntersection: false,
      drawError: { color: 'red', message: '<strong>Boundary points cannot intersect<strong>' }
    },

    // Disabling editing options that are not needed
    polyline: false,
    ellipse: false,
    rectangle: false,
    circle: false,
    circlemarker: false,
    marker: false,
    },
  edit: {
    featureGroup: editableLayers,
  }
}));

/**
 * Remove the option to "delete all layers"
 */
L.EditToolbar.Delete.include({
  removeAllLayers: false
})

/**
 * Add a custom control that when clicked on, zooms into the user's current location
 */
L.Control.CenterLocation = L.Control.extend({
  onAdd: function(map) {
      var div = L.DomUtil.create('div');

      div.innerHTML = "<span id='centreLoc' style='margin-top'><i class='fas fa-map-marker-alt'></i></span>";
      div.class = 'control-extend';
      div.style.width = "30px";
      div.style.height = "30px";
      div.style.backgroundColor = "white";
      div.style.textAlign = "center";
      div.style.fontSize = "24px"; 
      
      // Hover text
      div.title = "Centre map on current location";

      return div;
  }
});

// Set-up event for custom control
map.addControl(new L.Control.CenterLocation({ position: 'topleft' }));

// When clicked, the map flies to the user's current position
$("#centreLoc").parent().click(function (e) { 
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      map.flyTo([pos.coords.latitude, pos.coords.longitude], 16);
    });
  }
});


/**
 * Misc functions
 */
function processCoords(coords) {
  coords.forEach((coordSet) => delete coordSet.__vertex );
  $('#boundaries-input').val(JSON.stringify(coords));
}