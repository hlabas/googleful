function ContentTypeSheet() {
  this.cts_ = new ContentTypes();
  this.cma_ = new Contentful();
  this.locs_ = new Locales();
}


/**
 * Initializes a sheet using a given content type.
 * @param  {Object} contentType Content type to use for initialization.
 */
ContentTypeSheet.prototype.init = function (contentType, sheet, localeCode) {
  // TODO: handle locales properly
  if (localeCode === undefined) {
    var settings = Configuration.getCurrent();
    localeCode = settings.localeCode ? settings.localeCode : 'en-US';
  }
  this.localeCode_ = localeCode;

  this.contentType_ = contentType;
  this.sheet_ = sheet;

  this.sheet_.clear();
  this.sheet_.getRange(1,1, this.sheet_.getMaxRows(),
      this.sheet_.getMaxColumns()).clearDataValidations();

  // Get entries.
  var entries = this.cma_.apiCall('/entries?content_type=' +
      this.contentType_.sys.id);

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
    this.sheet_.getRange(3,1, entriesContent.length, columns.length)
        .setValues(entriesContent);
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
  var columns = [
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
  for (i = 0; i < this.contentType_.fields.length; i++) {
    var ctField = this.contentType_.fields[i];
    var renderer = this.getFieldRenderer_(ctField);
    var validationRules = this.buildValidationRules_(ctField);
    colRange = this.sheet_.getRange(3, i + 3, this.sheet_.getMaxRows() - 2, 1);
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
  this.sheet_.getRange(1, 3).setValue(this.contentType_.name).setFontSize(14)
      .setFontWeight('bold');

  // Content type ID
  this.sheet_.getRange(1, 4).setValue(this.contentType_.sys.id)
      .setFontFamily('Source Code Pro')
      .setFontSize(11)
      .setFontColor('#444444');

  // Locale
  var rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(this.locs_.getLocaleCodes())
      .setAllowInvalid(false);
  this.sheet_.getRange(1, 5).setValue(this.localeCode_)
      .setFontWeight('bold')
      .setFontSize(10)
      .setFontColor('#0000FF')
      .setDataValidation(rule);

  this.sheet_.setFrozenRows(2);     // Content type name and column headers.
  this.sheet_.setFrozenColumns(2);  // ID and version columns.
  this.sheet_.hideColumns(1,2);     // Hide ID and version.

  // Set header names
  var headersRow = this.sheet_.getRange(2, 1, 1, columnHeaders.length)
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
  for (var j = 2; j < columns.length; j++) {
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


/**
 * Computes the cell renderer to use depending on the Contentful field type.
 * @private
 * @param  {Object} field The Contentful field descriptor.
 * @return {FieldRenderer} The cell renderer to use for the field.
 */
ContentTypeSheet.prototype.getFieldRenderer_ = function (field) {
  switch (field.type) {
    case 'Array':
      return new ArrayRenderer(field.items.type == 'Link' ? field.items.linkType
          : field.items.type);
    case 'Object':
      return new ObjectRenderer();
    case 'Integer':
    case 'Number':
      return new NumberRenderer();
    case 'Link':
      return new LinkRenderer(field.linkType);
    case 'Location':
      return new LocationRenderer();
  }
  return new StringRenderer();
};


/**
 * Builds a set of validation rules to apply to a column used for rendering a
 * given field.
 * @param  {Object} field      The field for which the validation rules must be
 *                             built.
 * @return {Array<Validation>} The list of validations to use for the column.
 */
ContentTypeSheet.prototype.buildValidationRules_ = function(field) {
  var rules = [];
  if (field.required) {
    rules.push(new RequiredValidation());
  }
  for (var i = 0; i < field.validations.length; i++) {
    var val = field.validations[i];
    var ruleName = Object.keys(val)[0];
    var rule = val[ruleName];
    switch (ruleName) {
      case 'in':
        rules.push(new InValidation(rule));
        break;
      case 'range':
        rules.push(new RangeValidation(rule));
        break;
      case 'size':
        rules.push(new SizeValidation(rule));
        break;
      case 'regexp':
        rules.push(new RegexpValidation(rule));
        break;
      case 'unique':
        rules.push(new UniqueValidation());
        break;
    }
  }
  return rules;
};
