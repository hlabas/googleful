/**
 * Contentful API gateway.
 */
var Contentful = function () {
  this.isRateLimited_ = false;
  this.token_ = null;
  this.oauth_ = null;
  this.clientId_ = null;
  this.clientSecret_ = null;
  this.spaceId_ = null;
  this.pending_ = [];
  this.fetchAPISettings_();
  // TODO: handle rate limiting using a time based trigger.
  // this.monitorInterval_ = setInterval(this.monitorRateLimiting_.bind(this),
  //     1000);
};


Contentful.AUTH_URL = 'https://be.contentful.com/oauth/authorize';


Contentful.TOKEN_URL = 'https://be.contentful.com/oauth/authorize';


Contentful.SCOPE = 'content_management_manage';


Contentful.TOKEN_KEY = 'authToken';


Contentful.SPACE_KEY = 'spaceId';


Contentful.CLIENT_ID_KEY = 'clientId';


Contentful.CLIENT_SECRET_KEY = 'clientSecret';


Contentful.API_BASE = 'https://api.contentful.com';


/**
 * Initialises the object with preexisting settings that another user might have
 * set.
 */
Contentful.prototype.fetchAPISettings_ = function() {
  var props = PropertiesService.getDocumentProperties();
  this.token_ = props.getProperty(Contentful.TOKEN_KEY);
  this.clientId_ = props.getProperty(Contentful.CLIENT_ID_KEY);
  this.clientSecret_ = props.getProperty(Contentful.CLIENT_SECRET_KEY);
  this.spaceId_ = props.getProperty(Contentful.SPACE_KEY);
};


/**
 * Persists properties in the document for future usage by other users.
 */
Contentful.prototype.persistAPISettings_ = function() {
  var props = PropertiesService.getDocumentProperties();
  if (this.token_ === null) {
    props.deleteProperty(Contentful.TOKEN_KEY);
  } else {
    props.setProperty(Contentful.TOKEN_KEY, this.token_);
  }
  if (this.clientId_ === null) {
    props.deleteProperty(Contentful.CLIENT_ID_KEY);
  } else {
    props.setProperty(Contentful.CLIENT_ID_KEY, this.clientId_);
  }
  if (this.clientSecret_ === null) {
    props.deleteProperty(Contentful.CLIENT_SECRET_KEY);
  } else {
    props.setProperty(Contentful.CLIENT_SECRET_KEY, this.clientSecret_);
  }
  if (this.spaceId_ === null) {
    props.deleteProperty(Contentful.SPACE_KEY);
  } else {
    props.setProperty(Contentful.SPACE_KEY, this.spaceId_);
  }
};


/**
 * Tells whether or not the object has access to the API through a token.
 * @return {boolean} true if an API token is present.
 */
Contentful.prototype.hasAccess = function() {
  return this.token_ !== null;
};


Contentful.prototype.monitorRateLimiting_ = function () {
  this.isRateLimited_ = false;
  if (this.pending_.length > 0) {
    _.each(this.pending_, function(callDetails) {
      this.performCall_(callDetails);
    }.bind(this));
  }
};

/**
 * Sets the CMA Application credentials in order to fetch an API token through
 * OAuth.
 * @param {string} clientId     The App ID.
 * @param {string} clientSecret The App's secret.
 * @param {string} opt_spaceId  Space ID to use to perform calls to the API.
 */
Contentful.prototype.configure = function (clientId, clientSecret, opt_spaceId) {
  this.clientId_ = clientId;
  this.clientSecret_ = clientSecret;
  if (opt_spaceId) {
    this.spaceId_ = opt_spaceId;
  }
  this.persistAPISettings_();
};


/**
 * Sets the space ID to use for all space-related API calls.
 * @param {string} spaceId Space ID to use to perform calls to the API.
 */
Contentful.prototype.setSpaceId = function (spaceId) {
  this.spaceId_ = spaceId;
  this.persistAPISettings_();
};


Contentful.prototype.getSpaceId = function () {
  return this.spaceId_;
};


Contentful.prototype.getClientId = function () {
  return this.clientId_;
};


Contentful.prototype.getClientSecret = function () {
  return this.clientSecret_;
};

/**
 * Clears authentication data.
 * @private
 */
Contentful.prototype.clearAuthData_ = function () {
  if (this.oauth_ === null) {
    // Any remaining settings should also be reset
    this.initOAuth_();
  }
  this.oauth_.reset();
  this.token_ = null;
};


/**
 * Resets the authentication token.
 */
Contentful.prototype.resetAuth = function() {
  this.clearAuthData_();
  this.persistAPISettings_();
};


/**
 * Resets the all the configuration, as well as the authentication token.
 */
Contentful.prototype.resetConfig = function() {
  // First clear auth data that could require client ID and secret, then clear
  // settings.
  this.clearAuthData_();
  this.clientId_ = null;
  this.clientSecret_ = null;
  this.spaceId_ = null;
  this.persistAPISettings_();
};


/**
 * @return {OAuth} An OAuth service used to authenticate against Contentful
 *     OAuth endpoint.
 */
Contentful.prototype.initOAuth_ = function() {
  if (this.oauth_ === null && this.clientId_ !== null &&
      this.clientSecret_ !== null) {
    var appConfig = Configuration.getCurrent();
    this.oauth_ = OAuth2.createService('contentful', appConfig.appId)
      .setAuthorizationBaseUrl(Contentful.AUTH_URL)
      .setTokenUrl(Contentful.TOKEN_URL)
      .setClientId(this.clientId_)
      .setClientSecret(this.clientSecret_)
      .setPropertyStore(PropertiesService.getDocumentProperties())
      .setParam('response_type', 'token') // For some reason, Contentful OAuth doesn't like the bundled "response_type=code"
      .setTokenFormat('application/x-www-form-urlencoded')
      .setScope(Contentful.SCOPE);
  } else {
    this.oauth_ = null;
  }
  return this.oauth_;
};


/**
 * Returns the authentication token for using Contentful's Management API.
 * @return {string} The Content Management API token.
 */
Contentful.prototype.getToken = function() {
  return this.token_;
};


/**
 * Defines an authentication token to use after authentication has been
 * performed.
 * @param {string} token The token to use to call the Contentful API.
 */
Contentful.prototype.setToken = function(token) {
  this.token_ = token;
  if (this.oauth_ === null) {
    this.initOAuth_();
  }
  this.oauth_.saveToken_({
    access_token: token,
    granted_time: getTimeInSeconds_(new Date()),
    refresh_token: true
  });
  this.persistAPISettings_();
};


/**
 * Returns the authorization URL for getting the Contentful token.
 * @return {string} The authorization URL to use for authenticating the app.
 */
Contentful.prototype.getAuthorizationUrl = function() {
  if (this.initOAuth_()) {
    return this.oauth_.getAuthorizationUrl();
  }
  return null;
};


/**
 * Lets know if the service is configured.
 * @return {Boolean} true if the service is configured, false otherwise.
 */
Contentful.prototype.isConfigured = function () {
  return this.clientId_ !== null &&
      this.clientSecret_ !== null;
};

Contentful.prototype.performCall_ = function (callDetails) {
  if (this.isRateLimited_) {
    this.pending_.push(callDetails);
    return;
  }
  var response = UrlFetchApp.fetch(callDetails.path, callDetails.options);
  var rateLimitSeconds = response.getHeaders()['x-contentful-ratelimit-second-remaining'];
  if (rateLimitSeconds === 0) {
    this.isRateLimited_ = true;
  }
  var responseBody = JSON.parse(response.getContentText());
  var isError = responseBody.sys.type === 'Error';
  return {
    "isError": isError,
    "message": isError ? responseBody.sys.message : 'Success',
    "body": JSON.parse(response.getContentText())
  };
};

/**
 * Performs a Content Management API call.
 * @param  {string} path    URL path to use for the call
 * @param  {string} method  HTTP method to send (defaults to GET)
 * @return {Object}         The JSON response from the API call.
 */
Contentful.prototype.baseGet = function(path, headers) {
  var options = {
    "method": 'get',
    "headers": _.extend({
      "Authorization": "Bearer " + this.token_
    }, headers || {})
  };
  path = this.sanitizePath_(path);
  return this.performCall_({
    "path": Contentful.API_BASE + path,
    "options": options
  });
};


/**
 * Performs a Content Management API call for configured space.
 * @param  {string} path URL path to use for the call
 * @return {Object}      The JSON response from the API call.
 */
Contentful.prototype.get = function(path, headers) {
  if (!this.spaceId_) {
    throw new Error('No Space ID was configured. Call to "' + path + '" aborted.');
  }
  path = this.sanitizePath_(path);
  return this.baseGet('/spaces/' + this.spaceId_ + path, headers);
};


/**
 * Performs a PUT on the API for the configured space.
 * @param  {string} path    Path after /spaces/SPACE_ID to call.
 * @param  {Object} headers Headers to add to the request.
 * @param  {Object} body    Body of the request.
 * @return {Object}         API call result.
 */
Contentful.prototype.put = function (path, headers, body) {
  var options = {
    "method": 'put',
    "headers": _.extend({
      "Authorization": 'Bearer ' + this.token_
    }, headers || {}),
    "payload": JSON.stringify(body),
    "contentType": 'application/vnd.contentful.management.v1+json',
    "muteHttpExceptions": true
  };
  path = this.sanitizePath_(path);
  return this.performCall_({
    "path": Contentful.API_BASE + '/spaces/' + this.spaceId_ + path,
    "options": options
  });
};


/**
 * Sanitizes a path used as part of an API call.
 * @param  {string} path Path to sanitize.
 * @return {string}      Sanitized path.
 */
Contentful.prototype.sanitizePath_ = function (path) {
  if (path.indexOf('/') !== 0) {
    path = '/' + path;
  }
  return path;
};
