function DateRenderer() {
}

DateRenderer.prototype.renderValue = function(fieldValue) {
  // Parse ISO format, as for some reason Google App Script doesn't support
  // parsing this format.
  var matches = fieldValue.match(/([0-9]{4})-([0-9]{2})-([0-9]{2})T?([0-9]{2})?\:?([0-9]{2})?([\+|\-][0-9]{2}\:[0-9]{2})?/);
  var date = new Date(matches[1], matches[2], matches[3], matches[4] || 0, matches[5] || 0);
  // Apply timezone if any.
  if (matches[6]) {
    var parts = matches[6].match(/([\+|\-])([0-9]{2})\:([0-9]{2})/);
    var hours = parseInt(parts[2], 10);
    if (parts[1] === '-') {
      hours = -hours;
    }
    var secs = hours * 3600 + parseInt(parts[3], 10) * 60;
    date.setTime(date.getTime() + secs * 1000);
  }
  return date;
};

DateRenderer.prototype.formatColumn = function(range) {
  range.setFontColor('blue').setNumberFormat('yyyy-mm-dd hh:mm');
};
