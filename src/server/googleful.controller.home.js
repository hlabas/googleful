/**
 * Home controller, in charge of proposing various options for editing
 * Contentful content.
 */
function HomeController() {
  this.cma = new Contentful();
  // this.cache = new Cache();
  // this.contentTypes = this.cache.get(HomeController.CT_CACHE);
}


/**
 * Cache key for storing content types.
 * @type {String}
 */
HomeController.CT_CACHE = 'contentTypes';


/**
 * Displays the home view.
 */
HomeController.prototype.showView = function() {
  if (!this.cma.hasAccess()) {
    var error = HtmlService.createTemplateFromFile('googleful.ui.error')
                    .evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME);
    SpreadsheetApp.getUi().showSidebar(error);
    return;
  }
  var template = HtmlService.createTemplateFromFile('googleful.ui.home');
  if (!this.contentTypes) {
    this.contentTypes = this.cma.apiCall('/content_types');
    // this.cache.set(HomeController.CT_CACHE, this.contentTypes);
  }
  template.contentTypes = this.contentTypes.items;
  SpreadsheetApp.getUi()
      .showSidebar(template.evaluate().setTitle('Contentful binding')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME));
};


/**
 * Refreshes the list of content type from the cache.
 * @return {Array<Object>} The list of content types.
 */
HomeController.prototype.refreshContentTypes = function () {
  this.contentTypes = this.cma.apiCall('/content_types');
  //  this.cache.set(HomeController.CT_CACHE, this.contentTypes);
  return this.contentTypes;
};


/**
 * Initializes a sheet using a given content type.
 * @param  {string} contentTypeId ID of the content type to use for
 *                                initialization.
 */
HomeController.prototype.initSheet = function (contentTypeId) {
  this.refreshContentTypes();
  var contentType = this.getContentTypeById_(contentTypeId);
  var currentSheet = this.checkForExistingBinding_(contentType.name);
  if (null === currentSheet) {
    // There was an existing binding and user asked to use it.
    return;
  }
  currentSheet.clear();
  currentSheet.getRange(1,1, currentSheet.getMaxRows(), currentSheet.getMaxColumns())
      .clearDataValidations();

  // Get entries.
  var entries = this.cma.apiCall('/entries?content_type=' + contentType.sys.id);

  // Get the column headers based on the fields, define rendering and validation
  // rules.
  var columns = this.formatEntriesGrid_(currentSheet, contentType);
  var columnHeaders = _.map(columns, function(col) {
    return col.name;
  });

  this.formatHeader_(currentSheet, contentType, columnHeaders);

  var entriesContent = [];
  for (i = 0; i < entries.items.length; i++) {
    var entry = entries.items[i];
    var entryRow = this.renderRow_(entry, columns);
    entriesContent.push(entryRow);
  }
  if (entriesContent.length > 0) {
    currentSheet.getRange(3,1, entriesContent.length, columns.length)
        .setValues(entriesContent);
  }
};


/**
 * Formats the entries grid using renderers and validation rules according to
 * the content type's fields.
 * @private
 * @param  {Sheet}  currentSheet The sheet in which we're operating.
 * @param  {Object} contentType  The content type to use for initializing the
 *                               grid.
 * @return {Array<Object>}       List of column descriptors containing:
 *                                  - id: The field ID.
 *                                  - name: The field name
 *                                  - renderer: The cell renderer
 *                                  - rules: The validation rules
 */
HomeController.prototype.formatEntriesGrid_ = function (currentSheet, contentType) {
  var columns = [];
  for (i = 0; i < contentType.fields.length; i++) {
    var ctField = contentType.fields[i];
    var renderer = this.getFieldRenderer_(ctField);
    var validationRules = this.buildValidationRules_(ctField);
    var colRange = currentSheet.getRange(3, i + 1, currentSheet.getMaxRows() - 2, 1);
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
      id: ctField.id,
      name: ctField.name,
      renderer: renderer,
      rules: validationRules
    });
  }
  return columns;
};


/**
 * Checks whether there's an existing sheet with the content type's name and
 * proposes to navigate to it.
 * @private
 * @param  {stirng} contentTypeName Name of the content type, used for the sheet
 *                                  title.
 * @return {Sheet}                  The current sheet if user chose to create a
 *                                  new sheet regardless of the existing one,
 *                                  null otherwise.
 */
HomeController.prototype.checkForExistingBinding_ = function (contentTypeName) {
  var currentSheet = SpreadsheetApp.getActiveSheet();
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var existingSheet = activeSpreadsheet.getSheetByName(contentTypeName);
  if (existingSheet !== null && existingSheet.getIndex() !== currentSheet.getIndex()) {
    var ui = SpreadsheetApp.getUi();
    var response = ui.alert('A sheet is already named after this content type. Do you want to navigate there instead?',
        ui.ButtonSet.YES_NO);
    if (response == ui.Button.YES) {
      SpreadsheetApp.setActiveSheet(existingSheet);
      return null;
    } else {
      var copyCount = 1;
      while (existingSheet !== null) {
        existingSheet = activeSpreadsheet.getSheetByName(contentTypeName + ' ' + copyCount++);
      }
      currentSheet.setName(contentTypeName + ' ' + --copyCount);
    }
  } else {
    currentSheet.setName(contentTypeName);
  }
  return currentSheet;
};


/**
 * Returns the content type using its ID.
 * @private
 * @param  {string} contentTypeId ID of the content type to get.
 * @return {object}               Founds content type object.
 */
HomeController.prototype.getContentTypeById_ = function (contentTypeId) {
  var contentType = null;
  for (var i = 0; i < this.contentTypes.items.length; i++) {
    if (this.contentTypes.items[i].sys.id == contentTypeId) {
      contentType = this.contentTypes.items[i];
      break;
    }
  }
  return contentType;
};


/**
 * Init sheet name with content type's and add headers as second row.
 * @private
 * @param  {Spreadsheet}   currentSheet  The current sheet in which to initialize
 *                                       headers.
 * @param  {Object}        contentType   The content type containing the fields.
 * @param  {Array<string>} columnHeaders List of column headers.
 */
HomeController.prototype.formatHeader_ = function (currentSheet, contentType, columnHeaders) {
  currentSheet.getRange(1, 1).setValue(contentType.name).setFontSize(14)
      .setFontWeight('bold');
  currentSheet.getRange(1, 2).setValue(contentType.sys.id)
      .setFontFamily('Source Code Pro')
      .setFontSize(11)
      .setFontColor('#444444');
  currentSheet.setFrozenRows(2);
  var headersRow = currentSheet.getRange(2, 1, 1, columnHeaders.length)
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
HomeController.prototype.renderRow_ = function (entry, columns) {
  // TODO: handle locales properly
  var settings = Configuration.getCurrent();
  var localeCode = settings.localeCode ? settings.localeCode : 'en-US';

  var entryRow = [];
  for (var j = 0; j < columns.length; j++) {
    var col = columns[j];
    if (entry.fields.hasOwnProperty(col.id)) {
      if (!entry.fields[col.id].hasOwnProperty(localeCode)) {
        entryRow.push('ERROR: unable to find the locale property for this field: ' +
            col.id);
      }
      var fieldValue = entry.fields[col.id][localeCode];
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
HomeController.prototype.getFieldRenderer_ = function (field) {
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
HomeController.prototype.buildValidationRules_ = function(field) {
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
