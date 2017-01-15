function LocationRenderer() {
}

LocationRenderer.prototype.renderValue = function(fieldValue) {
  return "Lat: " + fieldValue.lat + " Lon: " + fieldValue.lon;
};

LocationRenderer.prototype.formatColumn = function(range) {
  range.setFontColor('darkgreen');
};
