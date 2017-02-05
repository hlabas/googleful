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
  var sheet = SpreadsheetApp.getActiveSheet();

  _.each(this.editedEntries_, function (edition, entryKey) {
    try {
      var tmp = entryKey.split(':');
      var entryId = tmp[0];
      var version = tmp[1];
      var editedRow = tmp[2];
      var numCols = tmp[3];
      var headers = {};
      var apiResponse = null;
      var body = {
        "fields": edition.fields
      };
      if (edition.isNew) {
        // Create entry
        headers['X-Contentful-Content-Type'] = edition.ctId;
        apiResponse = this.cma_.post('/entries', headers, body);
      } else {
        // Update entry
        headers['X-Contentful-Version'] = version;
        apiResponse = this.cma_.put('/entries/' + entryId, headers, body);
      }
      if (apiResponse.isError) {
        Logger.log('ERROR: ' + entryKey);
        Logger.log(JSON.stringify(apiResponse, null, 2));
        response.push({
          "error": apiResponse.message,
          "body": apiResponse.body
        });
      } else {
        // Update version and ID
        var editedEntry = apiResponse.body;
        var sysRange = sheet.getRange(editedRow, 1, 1, 2);
        var rowRange = sheet.getRange(editedRow, ContentTypeSheet.SKIP_COLS,
            1, numCols);
        sysRange.setValues([[
          editedEntry.sys.id,
          editedEntry.sys.version
        ]]);
        rowRange.setBackgroundColor('#fffde0');
        response.push(editedEntry);
      }
    } catch (e) {
      Logger.log(e);
      response.push({
        "error": e.message
      });
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
  var sheet = SpreadsheetApp.getActiveSheet();
  var ctId = sheet.getRange(ContentTypeSheet.CT_ID_RANGE).getValue();
  var localeCode = sheet.getRange(ContentTypeSheet.LOCALE_RANGE).getValue();
  var ct = this.cts_.getContentTypeById(ctId);
  var row = e.range.getRow();
  var entryValuesRange = sheet.getRange(
      row, ContentTypeSheet.ENTRIES_START_COL,
      1, ct.fields.length);
  var entryValues = entryValuesRange.getValues()[0];
  var sys = sheet.getRange(row, 1, 1, 2).getValues()[0];
  var entryId = sys[0];
  var version = sys[1];
  var numCols = ct.fields.length;
  var editKey = entryId + ':' + version + ':' + row + ':' + numCols;
  var isNewEntry = (entryId === '');
  var entryJSON = {
    "ctId": ctId,
    "isNew": isNewEntry,
    "fields": {}
  };
  // Mark row
  entryValuesRange.setBackgroundColor(isNewEntry ? '#e2f7f0' : '#def9ff');
  for (var i = 0; i < ct.fields.length; i++) {
    var field = ct.fields[i];
    var fieldValue = Fields.fieldValueToJSON(entryValues[i], field, localeCode);
    if (fieldValue !== null) {
      entryJSON.fields[field.id] = fieldValue;
    }
  }
  this.editedEntries_[editKey] = entryJSON;
  this.cache_.put(EditingController.EDITED_CACHE, this.editedEntries_);
  return this.editedEntries_;
};
