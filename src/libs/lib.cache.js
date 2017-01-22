/**
 * Cache for values to attache either to connected user or to the document.
 * @param {boolean?} userCache Use the user's cache storage if true, the
 *                             document's if false. Defaults to false.
 */
function Cache(userCache) {
  this.props_ = userCache ? CacheService.getUserCache() :
      CacheService.getDocumentCache();
}


/**
 * Key to prefix cached elements + used for the index.
 * @type {String}
 */
Cache.PROP_KEY = '_CF_CACHE_';


/**
 * Stores a value in the cache with an expiration
 * @param {string} key    The cache key
 * @param {object} value  The value to cache
 * @param {number} expire The expiration time in seconds. Defaults to 24 hrs.
 */
Cache.prototype.put = function (key, value, expire) {
  if (isNaN(expire)) {
    this.props_.put(Cache.PROP_KEY + key, JSON.stringify(value));
  } else {
    this.props_.put(Cache.PROP_KEY + key, JSON.stringify(value), expire);
  }
};


/**
 * Gets a cached value.
 * @param  {string} key           The cache key
 * @param  {mixed}  defaultValue  The default value in case the cache is not
 *                                there or expired.
 * @return {boolean|null|Object}  defaultValue if nothing present in the cache
 *                                or expired, the value otherwise.
 */
Cache.prototype.get = function (key, defaultValue) {
  var val = this.props_.get(Cache.PROP_KEY + key);
  if (defaultValue !== undefined && val === null) {
    return defaultValue;
  }
  return JSON.parse(val);
};


/**
 * Removes a value from the cache.
 * @param  {string} key The cache key
 */
Cache.prototype.remove = function (key) {
  this.cache_.remove(Cache.PROP_KEY + key);
};


/**
 * Removes all values from the cache.
 */
Cache.prototype.removeAll = function () {
  this.cache_.removeAll();
};
