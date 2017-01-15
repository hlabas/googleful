function LinkRenderer(linkType) {
  this.linkType_ = linkType;
}

LinkRenderer.prototype.renderValue = function(fieldValue) {
  return this.linkType_ + ': ' + fieldValue.sys.id;
};

LinkRenderer.prototype.formatColumn = function(range) {
  range.setFontStyle('italic').setFontColor('#444444');
};
