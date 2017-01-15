
/**
 * Home controller, in charge of proposing various options for editing
 * Contentful content.
 */
function HomeController() {
  this.cma = new Contentful();
  // this.cache = new Cache();
  // this.contentTypes = this.cache.get(HomeController.CT_CACHE);
}


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
  var html = HtmlService.createTemplateFromFile('googleful.ui.home');
  if (!this.contentTypes) {
    this.contentTypes = this.cma.apiCall('/content_types');
    // this.cache.set(HomeController.CT_CACHE, this.contentTypes);
  }
  html.contentTypes = this.contentTypes.items;
  SpreadsheetApp.getUi()
      .showSidebar(html.evaluate().setTitle('Contentful panel')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME));
};

HomeController.prototype.refreshContentTypes = function () {
  this.contentTypes = this.cma.apiCall('/content_types');
  //  this.cache.set(HomeController.CT_CACHE, this.contentTypes);
  return this.contentTypes;
};


HomeController.prototype.initSheet = function (contentTypeId) {
  // Check if user is ready.
  // var ui = SpreadsheetApp.getUi();
  // var response = ui.alert('This will clear the contents of this sheet. Continue?',
  //     ui.ButtonSet.YES_NO);
  // if (response == ui.Button.NO) {
  //   return;
  // }
  this.refreshContentTypes();

  var currentSheet = SpreadsheetApp.getActiveSheet();
  currentSheet.clear();
  currentSheet.getRange(1,1, currentSheet.getMaxRows(), currentSheet.getMaxColumns())
      .clearDataValidations();

  // Find the content type from the list.
  var contentType = null;
  for (var i = 0; i < this.contentTypes.items.length; i++) {
    if (this.contentTypes.items[i].sys.id == contentTypeId) {
      contentType = this.contentTypes.items[i];
      break;
    }
  }
  var entries = this.cma.apiCall('/entries?content_type=' + contentType.sys.id);

  // Get the column headers based on the fields.
  var columns = [];
  var columnHeaders = [];  // Needed to init headers at once.
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
    columnHeaders.push(ctField.name);
    columns.push({
      id: ctField.id,
      renderer: renderer
    });
  }

  this.formatHeader_(contentType, columnHeaders);

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


HomeController.prototype.formatHeader_ = function (contentType, columnHeaders) {
  var currentSheet = SpreadsheetApp.getActiveSheet();

  // Init sheet name with content type's and add headers as second row
  currentSheet.setName(contentType.name);
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
