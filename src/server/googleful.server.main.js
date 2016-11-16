
/**
 * Calls a controller action with parameters as an object.
 * @param {string} controller The controller name.
 * @param {string} action The action function to invoke on the controller.
 * @param {object} param The parameters to pass to the action function.
 */
function call(controller, action, params) {
  var mvc = new MVC();
  mvc.whiteListController('Configuration');
  mvc.whiteListController('Home');

  mvc.invoke(controller, action, params);
}

/**
 * Passed into the configuration factory constructor
 * @return {googleful.json.Configuration} Default configuration settings.
 */
function getDefaultConfiguration_() {
  return {
    debug: false,
    sheets: {
      debugSpreadsheetId: null
    }
  };
}
