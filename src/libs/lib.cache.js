function Cache() {
  this.fetchCache_();
}


Cache.PROP_KEY = '__CF_CACHE';

/**
 * Stores a value in the cache with an expiration
 * @param {string} key    The cache key
 * @param {object} value  The value to cache
 * @param {number} expire The expiration time in seconds. Defaults to 24 hrs.
 */
Cache.prototype.set = function (key, value, expire) {
  if (isNaN(expire)) {
    expire = 24 * 60 * 3600; // 24 hrs expiration by default.
  }
  expire = expire * 1000;
  this.keys_[key] = {
    exp: new Date().getTime() + expire,
    val: value
  };
  this.saveCache_();
};


/**
 * Gets a cached value.
 * @param  {string} key           The cache key
 * @return {boolean|null|Object}  null if nothing present in the cache, false if
 *                                    cache was expired, the value otherwise.
 */
Cache.prototype.get = function (key) {
  var now = new Date().getTime();
  if (this.keys_.hasOwnProperty(key)) {
    var cached = this.keys_[key];
    if (cached.exp > now) {
      return cached.val;
    }
    delete this.keys_[key];
    this.saveCache_();
    return false;
  }
  return null;
};


/**
 * Persists the cache in the Document properties.
 * @private
 */
Cache.prototype.saveCache_ = function () {
  PropertiesService.getDocumentProperties().setProperty(Cache.PROP_KEY,
    JSON.stringify(this.keys_));
};


Cache.prototype.fetchCache_ = function () {
  this.keys_ = JSON.parse(PropertiesService.getDocumentProperties()
      .getProperty(Cache.PROP_KEY));
  if (!this.keys_) {
    this.keys_ = {};
    this.saveCache_();
  }
};
