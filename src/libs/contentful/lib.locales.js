/**
 * Locales management interface.
 */
function Locales() {
  this.cma_ = new Contentful();
  this.cache_ = new Cache();
  this.locales_ = this.cache_.get(Locales.LOCALES_CACHE, null);
  if (this.locales_ === null) {
    this.initLocales_();
  }
}


/**
 * Cache key for storing the spaces locales.
 * @type {String}
 */
Locales.LOCALES_CACHE = 'locales';


/**
 * Returns the locales of the space.
 * @return {Array<Object>} The list of locales of the space.
 */
Locales.prototype.getLocales = function () {
  return this.locales_;
};


Locales.prototype.getLocaleCodes = function () {
  return _.map(this.locales_, function (locale) {
    return locale.code;
  });
};


/**
 * Fetches and post treats locales available in the space.
 * @private
 */
Locales.prototype.initLocales_ = function () {
  var manageableLocales = _.filter(this.cma_.get('/locales').body.items,
      function (locale) {
        return locale.contentManagementApi;
      });
  this.locales_ = _.map(manageableLocales, function (locale) {
    return _.pick(locale, 'code', 'fallbackCode', 'default', 'name');
  });
  this.cache_.put(Locales.LOCALES_CACHE, this.locales_);
};
