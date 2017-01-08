var Contentful = function (spaceId) {
  var props = PropertiesService.getUserProperties();
  this.token_ = props.getProperty(Contentful.CF_TOKEN_KEY);
  if (spaceId) {
    this.setSpaceId(spaceId);
  }
};


Contentful.CF_TOKEN_KEY = 'authToken';


Contentful.CF_SPACE_KEY = 'spaceId';


Contentful.API_BASE = 'https://api.contentful.com';


Contentful.prototype.hasAccess = function() {
  return this.token_ !== null;
};


Contentful.prototype.setSpaceId = function (spaceId) {
  var props = PropertiesService.getUserProperties();
  if (spaceId) {
    props.setProperty(Contentful.CF_SPACE_KEY, spaceId);
  } else {
    spaceId = spaceId ? spaceId : props.getProperty(Contentful.CF_SPACE_KEY);
  }
  if (!spaceId) {
    throw new Error("No space ID provided");
  }
  this.spaceId_ = spaceId;
};


Contentful.prototype.resetAuth = function() {
  PropertiesService.getUserProperties().deleteProperty(Contentful.CF_TOKEN_KEY);
  this.token_ = null;
};


Contentful.prototype.setToken = function(token) {
  PropertiesService.getUserProperties().setProperty(Contentful.CF_TOKEN_KEY, token);
  this.token_ = token;
};


Contentful.prototype.getToken = function() {
  return this.token_;
};


Contentful.prototype.apiCall = function(path) {
  // TODO: handle additional headers as a parameter.
  var options = {
    "method": 'get',
    "headers": {
      "Authorization": "Bearer " + token
    }
  };

  var req = UrlFetchApp.fetch(Contentful.API_BASE + path, options);
  return JSON.parse(req.getContentText());
};
