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
  template.token = this.cma.getToken();
  template.data = {
    clientId: this.cma.getClientId(),
    clientSecret: this.cma.getClientSecret(),
    spaceId: this.cma.getSpaceId()
  };
  template.spaceSet = template.data.spaceId !== null;
  SpreadsheetApp.getUi()
    .showModalDialog(template.evaluate()
                       .setWidth(450)
                       .setHeight(600),
                     "Configuration");
};


/**
 * Lists spaces for current user.
 * @return {Object} The list of spaces connected application can access.
 */
ConfigurationController.prototype.listSpaces = function () {
  if (!this.cma.hasAccess()) {
    throw new Error('Contentful is not properly configured');
  }
  return this.cma.baseGet('/spaces');
};


/**
 * Returns the Content Management API token.
 * @return {string} The CMA token.
 */
ConfigurationController.prototype.initToken = function () {
  // Fetches the user token and stores it for the document.
  var token = new AuthCallbackController().getToken();
  this.cma.setToken(token);
  return this.cma.getToken();
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
