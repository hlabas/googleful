function NumberRenderer() {
}

NumberRenderer.prototype.renderValue = function(fieldValue) {
  return fieldValue;
};

NumberRenderer.prototype.formatColumn = function(range) {
  range.setFontColor('blue');
};
