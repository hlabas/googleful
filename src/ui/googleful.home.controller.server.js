
/**
 * Home controller, in charge of proposing various options for editing
 * Contentful content.
 */
function HomeController() {

}

/**
 * Displays the home view.
 */
HomeController.prototype.showView = function() {
  var html = HtmlService.createTemplateFromFile('googleful.home.view');
  html.mode = 'addon';
  SpreadsheetApp.getUi()
      .showSidebar(html.evaluate()
      .setSandboxMode(HtmlService.SandboxMode.IFRAME));
};

/**
 * Returns the content types available to query.
 * @param {String} mode Execution mode (add-on or webapp).
 */
HomeController.prototype.getContentTypes = function(mode) {
  var config = Configuration.getCurrent();
  if (!Contentful.hasAccess()) {
    Logger.log('Access invalid');
    return;
  }
  // TODO
};
