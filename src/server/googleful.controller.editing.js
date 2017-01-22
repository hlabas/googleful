function EditingController() {
  this.cache_ = new Cache(true);
  this.cma_ = new Contentful();
  this.editedEntries_ = this.cache_.get(EditingController.EDITED_CACHE, {});
  this.cts_ = new ContentTypes();
}


EditingController.EDITED_CACHE = 'pending';

EditingController.prototype.showView = function () {

};

EditingController.prototype.commitChanges = function () {
  // TODO: check conflicts, merge non conflicting, ask what to do about conflicts
  var response = [];
  var editedKeys = _.keys(this.editedEntries_);
  _.each(editedKeys, function (entryKey) {
    var fields = this.editedEntries_[entryKey];
    try {
      var tmp = entryKey.split(':');
      var entryId = tmp[0];
      var version = tmp[1];
      var body = {
        "fields": fields
      };
      var headers = {
        "X-Contentful-Version": version
      };
      response.push(this.cma_.put('/entries/' + entryId, headers, body));
    } catch (e) {
      response.push({ error: e.message });
    }
  }.bind(this));
  this.editedEntries_ = {};
  this.cache_.put(EditingController.EDITED_CACHE, this.editedEntries_);
  return response;
};


EditingController.prototype.getEditedEntries = function () {
  return this.editedEntries_;
};


EditingController.prototype.onEditTrigger = function (e) {
  var rangeSig = e.range.getA1Notation();
  var sheet = SpreadsheetApp.getActiveSheet();
  var ctId = sheet.getRange(1,4).getValue();
  var localeCode = sheet.getRange(1,5).getValue();
  var ct = this.cts_.getContentTypeById(ctId);
  var row = e.range.getRow();
  var entryId = sheet.getRange(row, 1).getValue();
  var version = sheet.getRange(row, 2).getValue();
  var editKey = entryId + ':' + version;
  var field = ct.fields[e.range.getColumn() - 3];
  var val = e.range.getValue();

  if (!this.editedEntries_.hasOwnProperty(editKey)) {
    this.editedEntries_[editKey] = {};
  }
  var fieldValue = val;
  if (field.localized) {
    fieldValue = {};
    fieldValue[localeCode] = val;
  }
  this.editedEntries_[editKey][field.id] = fieldValue;
  this.cache_.put(EditingController.EDITED_CACHE, this.editedEntries_);
};
