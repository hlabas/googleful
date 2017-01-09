
/**
 * Authentication callback controller, used as part of the authentication cycle.
 */
function AuthCallbackController() {
}


AuthCallbackController.TOKEN_KEY = 'CF_TOKEN';


AuthCallbackController.prototype.showView = function () {
  return HtmlService.createHtmlOutputFromFile('googleful.ui.authcallback');
};

/**
 * Sets the token to the UserProperties
 * @param {string} token Token to save
 */
AuthCallbackController.prototype.setToken = function (token) {
  // Temporarily sets the token to the user settings as we're not in the context
  // of the spreadsheet
  PropertiesService.getUserProperties().setProperty(
    AuthCallbackController.TOKEN_KEY, token);
};


/**
 * Returns the user's auth token.
 * @return {string} The token that can be used in the spreadsheet.
 */
AuthCallbackController.prototype.getToken = function () {
  return PropertiesService.getUserProperties().getProperty(
    AuthCallbackController.TOKEN_KEY);
};
