var Contentful = function () {
  var props = PropertiesService.getUserProperties();
  this.token_ = props.getProperty(this.TOKEN_KEY);
};

Contentful.TOKEN_KEY = 'authToken';

Contentful.prototype.hasAccess = function() {
  return this.token_ !== null;
};

Contentful.prototype.resetAuth = function() {
  PropertiesService.getUserProperties().deleteProperty(this.TOKEN_KEY);
  this.token_ = null;
};

Contentful.prototype.setToken = function(token) {
  PropertiesService.getUserProperties().setProperty(this.TOKEN_KEY, token);
  this.token_ = token;
};

Contentful.prototype.getToken = function() {
  return this.token_;
};
