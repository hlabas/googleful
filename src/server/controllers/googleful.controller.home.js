/**
 * Home controller, in charge of proposing various options for editing
 * Contentful content.
 */
function HomeController() {
  this.cts_ = new ContentTypes();
  this.cma_ = new Contentful();
  this.locs_ = new Locales();
}


/**
 * Displays the home view.
 */
HomeController.prototype.showView = function() {
  if (!this.cma_.hasAccess()) {
    var error = HtmlService.createTemplateFromFile('googleful.ui.error')
                    .evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME);
    SpreadsheetApp.getUi().showSidebar(error);
    return;
  }
  var template = HtmlService.createTemplateFromFile('googleful.ui.home');
  template.debug = Configuration.getCurrent().debug;
  template.locales = this.locs_.getLocales();
  template.contentTypes = this.cts_.getContentTypes();
  SpreadsheetApp.getUi()
      .showSidebar(
          template.evaluate()
          .setTitle('Contentful binding')
          .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      );
};


/**
 * Refreshes the list of content type from the cache.
 * @return {Array<Object>} The list of content types.
 */
HomeController.prototype.refreshContentTypes = function () {
  return this.cts_.getContentTypes(true);
};


HomeController.prototype.initSheet = function (contentTypeId, localeCode) {
  var contentType = this.cts_.getContentTypeById(contentTypeId);
  if (!contentType) {
    Logger.log('No content type with provided ID.');
    return;
  }
  var currentSheet = this.checkForExistingBinding_(contentType.name);
  if (null === currentSheet) {
    // There was an existing binding and user asked to use it.
    return;
  }
  new ContentTypeSheet().init(contentType, currentSheet, localeCode);
};


/**
 * Checks whether there's an existing sheet with the content type's name and
 * proposes to navigate to it.
 * @private
 * @param  {string} contentTypeName Name of the content type, used for the sheet
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
