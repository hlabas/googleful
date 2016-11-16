/**
 * Main entry point of the web app.
 * @return {String} HTML as string for Apps Script to render.
 */
function doGet(e) {
  let viewName = 'home';
  if (e.parameter.hasOwnProperty('act')) {
    switch (e.parameter.act) {
      case "home":
      case "authcallback":
        viewName = e.parameter.act;
        break;
      default:
        break;
    }
  }
  var html = HtmlService.createTemplateFromFile('googleful.' + viewName + '.view');
  html.mode = 'web';
  return html.evaluate()
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

function setToken(token) {
  // TODO
}
