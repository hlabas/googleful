function ContentTypeSheet() {
  this.cts_ = new ContentTypes();
  this.cma_ = new Contentful();
  this.locs_ = new Locales();
}


/**
 * Position of the Content Type ID in the sheet.
 * @type {String}
 */
ContentTypeSheet.CT_ID_RANGE = 'A1';


/**
 * Position of the Content type name in the sheet.
 * @type {String}
 */
ContentTypeSheet.CT_NAME_RANGE = 'C1';


/**
 * Position of the locale code in the sheet.
 * @type {String}
 */
ContentTypeSheet.LOCALE_RANGE = 'E1';


/**
 * Number of headers before starting having entries.
 * @type {Number}
 */
ContentTypeSheet.HEADERS_ROW = 2;


/**
 * Start row for entries.
 * @type {Number}
 */
ContentTypeSheet.ENTRIES_START_ROW = ContentTypeSheet.HEADERS_ROW + 1;


/**
 * Hidden columns used to store necessary data for pushing content back to
 * Contentful.
 * @type {Array}
 */
ContentTypeSheet.HIDDEN_COLUMNS = [
  {
    visible: false,
    id: 'entryId',
    name: 'Entry ID',
    renderer: new StringRenderer(),
    rules: []
  },
  {
    visible: false,
    id: 'version',
    name: 'Version',
    renderer: new NumberRenderer(),
    rules: []
  }
];


/**
 * Number of hidden columns
 * @type {Number}
 */
ContentTypeSheet.SKIP_COLS = ContentTypeSheet.HIDDEN_COLUMNS.length;


/**
 * Start column for entries field
 * @type {Number}
 */
ContentTypeSheet.ENTRIES_START_COL = ContentTypeSheet.SKIP_COLS + 1;


/**
 * Initializes a sheet using a given content type.
 * @param  {Object} contentType Content type to use for initialization.
 */
ContentTypeSheet.prototype.init = function (contentType, sheet, localeCode) {
  if (localeCode === undefined) {
    var settings = Configuration.getCurrent();
    localeCode = settings.localeCode ? settings.localeCode : 'en-US';
  }
  this.localeCode_ = localeCode;
  this.contentType_ = contentType;
  this.sheet_ = sheet;

  var protections = SpreadsheetApp.getActiveSpreadsheet()
      .getProtections(SpreadsheetApp.ProtectionType.RANGE);
  _.each(protections, function (protection) {
    protection.remove();
  });
  this.sheet_.clear();
  this.sheet_.getRange(1,1, this.sheet_.getMaxRows(),
      this.sheet_.getMaxColumns()).clearDataValidations();

  // Get entries.
  var entries = this.cma_.get('/entries?content_type=' +
      this.contentType_.sys.id).body;

  // Get the column headers based on the fields, define rendering and validation
  // rules.
  var columns = this.formatEntriesGrid_();
  var columnHeaders = _.map(columns, function(col) {
    return col.name;
  });

  this.formatHeader_(columnHeaders);
  var entriesContent = [];
  for (i = 0; i < entries.items.length; i++) {
    var entry = entries.items[i];
    var entryRow = this.renderRow_(entry, columns);
    entriesContent.push(entryRow);
  }
  if (entriesContent.length > 0) {
    this.sheet_.getRange(ContentTypeSheet.ENTRIES_START_ROW,1,
        entriesContent.length, columns.length).setValues(entriesContent);
  }
};


/**
 * Formats the entries grid using renderers and validation rules according to
 * the content type's fields.
 * @private
 *                               grid.
 * @return {Array<Object>}       List of column descriptors containing:
 *                                  - id: The field ID.
 *                                  - name: The field name
 *                                  - renderer: The cell renderer
 *                                  - rules: The validation rules
 */
ContentTypeSheet.prototype.formatEntriesGrid_ = function () {
  var startCol = ContentTypeSheet.ENTRIES_START_COL;
  var columns = _.clone(ContentTypeSheet.HIDDEN_COLUMNS);
  for (i = 0; i < this.contentType_.fields.length; i++) {
    var ctField = this.contentType_.fields[i];
    var renderer = Fields.getFieldRenderer(ctField);
    var validationRules = Fields.getValidationRules(ctField);
    colRange = this.sheet_.getRange(
        ContentTypeSheet.ENTRIES_START_ROW,
        i + startCol,
        this.sheet_.getMaxRows() - ContentTypeSheet.HEADERS_ROW,
        1);
    if (validationRules.length > 0) {
      var builder = SpreadsheetApp.newDataValidation();
      for (var j = 0; j < validationRules.length; j++) {
        var rule = validationRules[j];
        builder = rule.buildRule(builder, colRange);
      }
      colRange.setDataValidation(builder.build());
    }
    if (typeof(renderer.formatColumn) === 'function') {
      renderer.formatColumn(colRange);
    }
    columns.push({
      visible: true,
      id: ctField.id,
      name: ctField.name,
      renderer: renderer,
      rules: validationRules
    });
  }
  return columns;
};


/**
 * Init sheet name with content type's and add headers as second row.
 * @private
 * @param  {Array<string>} columnHeaders List of column headers.
 */
ContentTypeSheet.prototype.formatHeader_ = function (columnHeaders) {
  // Content type name
  this.sheet_.getRange(ContentTypeSheet.CT_NAME_RANGE)
      .setValue(this.contentType_.name)
      .setFontSize(14)
      .setFontWeight('bold');

  // Content type ID
  this.sheet_.getRange(ContentTypeSheet.CT_ID_RANGE)
      .setValue(this.contentType_.sys.id)
      .setFontFamily('Source Code Pro')
      .setFontSize(11)
      .setFontColor('#444444');

  // Locale
  var rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(this.locs_.getLocaleCodes())
      .setAllowInvalid(false);

  this.sheet_.getRange(ContentTypeSheet.LOCALE_RANGE)
      .setValue(this.localeCode_)
      .setFontWeight('bold')
      .setFontSize(10)
      .setFontColor('#0000FF')
      .setDataValidation(rule);

  // Content type name and column headers.
  this.sheet_.setFrozenRows(ContentTypeSheet.HEADERS_ROW);
  // ID and version columns.
  this.sheet_.setFrozenColumns(ContentTypeSheet.SKIP_COLS);
  // Hide ID and version.
  this.sheet_.hideColumns(1, ContentTypeSheet.SKIP_COLS);

  // Set header names
  var headersRow = this.sheet_.getRange(
      ContentTypeSheet.HEADERS_ROW,
      1,
      1,
      columnHeaders.length)
      .setFontWeight('bold');

  headersRow.setValues([
    columnHeaders
  ]);
};


/**
 * Renders an entry on a row of the entries grid.
 * @private
 * @param  {Object}        entry   The entry to render.
 * @param  {Array<Object>} columns The columns descriptors.
 * @return {Array}                 The entry values to display in the grid.
 */
ContentTypeSheet.prototype.renderRow_ = function (entry, columns) {
  // TODO: inelegant, parse columns properly with deep properties like sys.id
  var entryRow = [
    entry.sys.id,
    entry.sys.version
  ];
  for (var j = ContentTypeSheet.SKIP_COLS; j < columns.length; j++) {
    var col = columns[j];
    if (entry.fields.hasOwnProperty(col.id)) {
      if (!entry.fields[col.id].hasOwnProperty(this.localeCode_)) {
        entryRow.push('ERROR: unable to find the locale property for this field: ' +
            col.id);
      }
      var fieldValue = entry.fields[col.id][this.localeCode_];
      entryRow.push(col.renderer.renderValue(fieldValue));
    }
    else {
      entryRow.push('');
    }
  }
  return entryRow;
};
