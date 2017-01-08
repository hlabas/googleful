/**
 * Controller of the configuration view.
 */
function ConfigurationController () {
  this.cma = new Contentful();
}


/**
 * Prepares the data and renders the configuration view.
 */
ConfigurationController.prototype.showView = function () {
  var template = HtmlService.createTemplateFromFile('googleful.ui.configuration');
  template.authorizationUrl = this.cma.getAuthorizationUrl();
  template.configured = this.cma.isConfigured();
  template.authorized = this.cma.hasAccess();
  template.data = {
    clientId: this.cma.getClientId(),
    clientSecret: this.cma.getClientSecret(),
    spaceId: this.cma.getSpaceId()
  };
  SpreadsheetApp.getUi()
    .showModalDialog(template.evaluate()
                       .setWidth(450)
                       .setHeight(600),
                     "Configuration");
};


/**
 * Returns the Content Management API token.
 * @return {string} The CMA token.
 */
ConfigurationController.prototype.getToken = function () {
  return this.cma.getToken();
};


/**
 * Sets the Content Management API token.
 * @return {string} token The CMA token.
 */
ConfigurationController.prototype.setToken = function (token) {
  this.cma.setToken(token);
};


/**
 * Reset configuration server-side handler.
 */
ConfigurationController.prototype.resetConfig = function () {
  this.cma.resetConfig();
};


/**
 * Save space configuration server-side handler.
 * @param  {Object} config  Configuration object to save.
 * @return {boolean} True if the space configuration was saved.
 */
ConfigurationController.prototype.saveSpaceConfig = function (config) {
  var validation = /[a-z0-9-_]+/g;
  if (!config.spaceId.match(validation)) {
    return false;
  }
  this.cma.setSpaceId(config.spaceId);
  return true;
};


/**
 * Save App configuration server-side handler.
 * @param  {Object} config  Configuration object to save.
 * @return {boolean|string} The authorization URL to use or false if provided
 *                              parameters are invalid.
 */
ConfigurationController.prototype.saveAppConfig = function (config) {
  var validation = /[a-z0-9-_]+/g;
  if (!config.clientId.match(validation) ||
      !config.clientSecret.match(validation)) {
    return false;
  }
  this.cma.configure(config.clientId, config.clientSecret);
  return this.cma.getAuthorizationUrl();
};
