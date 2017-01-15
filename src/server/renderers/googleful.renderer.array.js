function ArrayRenderer(itemsType) {
  this.itemsType_ = itemsType;
}

ArrayRenderer.prototype.renderValue = function(fieldValue) {
  if (!Array.isArray(fieldValue)) {
    return 'ERROR';
  }
  if (fieldValue.length === 0) {
    return '';
  }
  switch (this.itemsType_) {
    case 'Asset':
      return this.pluralize_(fieldValue.length, ' asset');
    case 'Entry':
      return this.pluralize_(fieldValue.length, ' entry', ' entries');
  }
  return '"' + fieldValue.join('", "') + '"';
};

ArrayRenderer.prototype.formatColumn = function(range) {
  range.setFontStyle('italic').setFontColor('#444444');
};

ArrayRenderer.prototype.pluralize_ = function(size, text, plural) {
  return size > 1 ? (plural ? plural : text + 's') : text;
};
