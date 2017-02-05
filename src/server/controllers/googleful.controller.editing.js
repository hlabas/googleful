function EditingController() {
  this.cache_ = new Cache(true);
  this.cma_ = new Contentful();
  this.editedEntries_ = this.cache_.get(EditingController.EDITED_CACHE, {});
  this.cts_ = new ContentTypes();
}


EditingController.EDITED_CACHE = 'pending';


EditingController.CHANGED_COLOR = '#c0f1fa';


EditingController.CREATED_COLOR = '#d1fed8';


EditingController.SAVED_COLOR = '#fffde0';


EditingController.PUBLISHED_COLOR = '';


EditingController.prototype.showView = function () {

};


EditingController.prototype.publishSelected = function () {
  var response = [];
  var sheet = SpreadsheetApp.getActiveSheet();
  var selectedRange = sheet.getActiveRange();
  var firstRow = selectedRange.getRow();
  var lastRow = selectedRange.getLastRow();
  var sysRange = sheet.getRange(firstRow, 1, lastRow - firstRow + 1, 2);
  Logger.log(sysRange.getA1Notation());
  var sysValues = sysRange.getValues();
  Logger.log(sysValues);
  for (var i = 0; i < sysValues.length; i++) {
    try {
      var row = firstRow + i;
      var headers = {
        "X-Contentful-Version": sysValues[i][1]
      };
      var apiResponse = this.cma_.put('/entries/' + sysValues[i][0] + '/published',
          headers, null);
      if (apiResponse.isError) {
        Logger.log(JSON.stringify(apiResponse, null, 2));
        // return this.processEditError_(apiResponse, entryKey);
      } else {
        // Update version and ID
        var editedEntry = apiResponse.body;
        var localSysRange = sheet.getRange(row, 1, 1, 3);
        localSysRange.setValues([[
          editedEntry.sys.id,
          editedEntry.sys.version,
          editedEntry.sys.publishedVersion
        ]]);
        // Mark as saved
        var rowRange = sheet.getRange(
            row, ContentTypeSheet.ENTRIES_START_COL,
            1, sheet.getMaxColumns() - ContentTypeSheet.ENTRIES_START_COL);
        rowRange.setBackgroundColor(EditingController.PUBLISHED_COLOR);
      }
      response.push(apiResponse);
    } catch (e) {
      Logger.log(e);
      response.push({
        "error": e.message
      });
    }
  }
  return response;
};


EditingController.prototype.pushChanges = function () {
  // TODO: check conflicts, merge non conflicting, ask what to do about conflicts
  var response = [];
  _.each(this.editedEntries_, function (edition, entryKey) {
    try {
      response.push(this.processEdition_(edition, entryKey));
    } catch (e) {
      Logger.log(e);
      response.push({
        "error": e.message
      });
    }
  }, this);
  this.editedEntries_ = {};
  this.cache_.put(EditingController.EDITED_CACHE, this.editedEntries_);
  return response;
};


/**
 * Processes an edit action on a given entry.
 * @private
 * @param  {Object} edition  The edited entry to push to Contentful.
 * @param  {String} entryKey The key
 * @return {Object}          The response details.
 */
EditingController.prototype.processEdition_ = function (edition, entryKey) {
  var sheet = SpreadsheetApp.getActiveSheet();
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
    headers['X-Contentful-Version'] = edition.version;
    apiResponse = this.cma_.put('/entries/' + edition.entryId, headers, body);
  }
  if (apiResponse.isError) {
    return this.processEditError_(apiResponse, entryKey);
  } else {
    // Update version and ID
    var editedEntry = apiResponse.body;
    var sysRange = sheet.getRange(edition.row, 1, 1, 2);
    sysRange.setValues([[
      editedEntry.sys.id,
      editedEntry.sys.version
    ]]);
    // Mark as saved
    var rowRange = sheet.getRange(
        edition.row, ContentTypeSheet.ENTRIES_START_COL,
        1, edition.numFields);
    rowRange.setBackgroundColor(EditingController.SAVED_COLOR);
    return editedEntry;
  }
};


/**
 * Processes an edition error.
 * @private
 * @param  {Object} apiResponse Response from the API call to edit the entry.
 * @return {Object}             The error response.
 */
EditingController.prototype.processEditError_ = function (apiResponse, entryKey) {
  Logger.log('ERROR: ' + entryKey);
  Logger.log(JSON.stringify(apiResponse, null, 2));
  return {
    "error": apiResponse.message,
    "body": apiResponse.body
  };
};


/**
 * Returns the list of edit actions to process.
 * @return {Object} The list of edit actions to process.
 */
EditingController.prototype.getEditedEntries = function () {
  return this.editedEntries_;
};


/**
 * Triggered by a cell edit action.
 * @param  {Object} e The trigger event containing the details of what's been
 *                    edited.
 * @return {Object}   The processed edit action as an object.
 */
EditingController.prototype.onEditTrigger = function (e) {
  var sheet = SpreadsheetApp.getActiveSheet();
  var localeCode = sheet.getRange(ContentTypeSheet.LOCALE_RANGE).getValue();
  var ctId = sheet.getRange(ContentTypeSheet.CT_ID_RANGE).getValue();
  var ct = this.cts_.getContentTypeById(ctId);
  var row = e.range.getRow();
  var entryValuesRange = sheet.getRange(
      row, ContentTypeSheet.ENTRIES_START_COL,
      1, ct.fields.length);
  var entryValues = entryValuesRange.getValues()[0];
  var sys = sheet.getRange(row, 1, 1, 2).getValues()[0];
  var entryId = sys[0], version = sys[1];
  var editKey = this.serializeKey_(entryId, version, row, ct.fields.length);
  var isNewEntry = (entryId === '');
  var entryJSON = {
    "entryId": entryId,
    "version": version,
    "row": row,
    "numFields": ct.fields.length,
    "ctId": ctId,
    "isNew": isNewEntry,
    "fields": {}
  };

  // Mark row as created or changed.
  entryValuesRange.setBackgroundColor(isNewEntry ?
      EditingController.CREATED_COLOR : EditingController.CHANGED_COLOR
  );
  // Serialize fields to JSON.
  _.each(ct.fields, function (field, i) {
    var fieldValue = Fields.fieldValueToJSON(entryValues[i], field, localeCode);
    if (fieldValue !== null) {
      entryJSON.fields[field.id] = fieldValue;
    }
  });
  // Push changes to the cache.
  this.editedEntries_[editKey] = entryJSON;
  this.cache_.put(EditingController.EDITED_CACHE, this.editedEntries_);
  return this.editedEntries_;
};


/**
 * Serializes a key representing an edit action.
 * @private
 * @param  {String} entryId   Entry ID.
 * @param  {Number} version   Version of the entry.
 * @param  {Number} row       Row of the entry.
 * @param  {Number} numFields Number of fields
 * @return {String}           Serialized key.
 */
EditingController.prototype.serializeKey_ = function (entryId, version, row,
    numFields) {
  return entryId + ':' + version + ':' + row + ':' + numFields;
};


/**
 * Parses a key representing an edit action.
 * @private
 * @param  {String} key The serialized key.
 * @return {Onject}     Object with parsed parts (entryId, version, row,
 *                      numFields).
 */
EditingController.prototype.parseKey_ = function (key) {
  var parts = key.split(':'), i = 0;
  return {
    "entryId": parts[i++],
    "version": parts[i++],
    "row": parts[i++],
    "numCols": parts[i++]
  };
};
