function ObjectRenderer() {
}

ObjectRenderer.prototype.renderValue = function(fieldValue) {
  return JSON.stringify(fieldValue, null, 2);
};

ObjectRenderer.prototype.formatColumn = function(range) {
  range.setFontFamily('Source Code Pro')
    .setFontSize(9)
    .setFontColor('#444444');
};
