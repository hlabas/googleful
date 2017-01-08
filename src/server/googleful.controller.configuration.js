function ConfigurationController () {
  this.cma = new Contentful();
}

ConfigurationController.prototype.showView = function() {
  var html = HtmlService.createTemplateFromFile('googleful.ui.configuration');
  html.data = {
    "token": this.cma.getToken()
  };
  SpreadsheetApp.getUi()
      .showSidebar(html.evaluate()
      .setSandboxMode(HtmlService.SandboxMode.IFRAME));
};

ConfigurationController.prototype.saveConfig = function(config) {
  this.cma.setToken(config.token);
};
