
/**
 * Home controller, in charge of proposing various options for editing
 * Contentful content.
 */
function HomeController() {
  this.cma = new Contentful();
  this.cache = new Cache();
  this.contentTypes = this.cache.get(HomeController.CT_CACHE);
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
    this.cache.set(HomeController.CT_CACHE, this.contentTypes);
  }
  html.contentTypes = this.contentTypes.items;
  html.setTitle('Contentful panel');
  SpreadsheetApp.getUi()
      .showSidebar(html.evaluate()
      .setSandboxMode(HtmlService.SandboxMode.IFRAME));
};


HomeController.prototype.initSheet = function (contentTypeId) {
  var docProps = PropertiesService.getDocumentProperties();
  var ui = SpreadsheetApp.getUi();
  var settings = Configuration.getCurrent();
  // TODO: handle locales
  var localeCode = settings.localeCode ? settings.localeCode : 'en-US';
  var currentSheet = SpreadsheetApp.getActiveSheet();

  // Get the content type from the list.
  var contentType = null;
  for (var i = 0; i < this.contentTypes.items.length; i++) {
    if (this.contentTypes.items[i].sys.id == contentTypeId) {
      contentType = this.contentTypes.items[i];
      break;
    }
  }

  // Get the column headers based on the fields.
  var columnHeaders = [];
  var columnIds = [];
  for (i = 0; i < contentType.fields.length; i++) {
    columnHeaders.push(contentType.fields[i].name);
    columnIds.push(contentType.fields[i].id);
  }
  // Clear all data in the sheet prior to initializing it.
  currentSheet.clear();

  // Init sheet name with content type's and add headers as second row
  currentSheet.setName(contentType.name);
  currentSheet.getRange(1, 1).setValue(contentType.name).setFontSize(14).setFontWeight('bold');
  currentSheet.getRange(1, 2).setValue('https://api.contentful.com/spaces/f9t56shjzdja/entries?content_type=' + contentType.sys.id)
    .setFontFamily('Source Code Pro')
    .setFontSize(12);
  currentSheet.setFrozenRows(2);

  var headersRow = currentSheet.getRange(2, 1, 1, columnIds.length).setFontWeight('bold');
  headersRow.setValues([
    columnHeaders
  ]);

  // Fetch first content and initialize spreadsheet
  var entries = this.cma.apiCall('/entries?content_type=' + contentType.sys.id);
  var entriesContent = [];
  for (i = 0; i < entries.items.length; i++) {
    var entry = entries.items[i];
    var entryRow = [];
    for (var j = 0; j < columnIds.length; j++) {
      var id = columnIds[j];
      var value = null;
      if (entry.fields.hasOwnProperty(id)) {
        try {
          switch (typeof(entry.fields[id][localeCode])) {
            default:
            case 'string':
              value = entry.fields[id][localeCode];
              break;
            case 'object':
              if (Array.isArray(entry.fields[id][localeCode])) {
                if (typeof(entry.fields[id][localeCode][0]) == 'object') {
                  // List of objects
                  value = 'Ref: see list';
                } else {
                  value = entry.fields[id][localeCode].join(', ');
                }
              } else {
                value = 'Ref: ' + entry.fields[id][localeCode].sys.id;
              }
              break;
          }
          entryRow.push(value);
        }
        catch (e) {
          Logger.log(e);
          Logger.log(entry);
          Logger.log('----');
          entryRow.push('ERR');
        }
      }
      else {
        entryRow.push('');
      }
    }
    entriesContent.push(entryRow);
  }
  currentSheet.getRange(3,1, entriesContent.length, columnIds.length).setValues(entriesContent);

  // Update settings
  if (!settings.hasOwnProperty("contentTypes")) {
    settings.contentTypes = [];
  }
  settings.contentTypes[currentSheet.getIndex()] = contentType.sys.id;
  docProps.setProperty('CF_SETTINGS', JSON.stringify(settings));
};
