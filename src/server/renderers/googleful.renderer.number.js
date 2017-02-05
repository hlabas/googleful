function NumberRenderer() {
}

NumberRenderer.prototype.renderValue = function(fieldValue) {
  return isNaN(fieldValue) ? '' : fieldValue;
};

NumberRenderer.prototype.formatColumn = function(range) {
  range.setFontColor('blue');
};
