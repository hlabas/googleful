function ContentTypes() {
  this.cma_ = new Contentful();
  this.cache_ = new Cache();
  this.contentTypes_ = this.cache_.get(ContentTypes.CT_CACHE);
  this.getContentTypes(this.contentTypes_ === null);
}


/**
 * Cache key for storing content types.
 * @type {String}
 */
ContentTypes.CT_CACHE = 'contentTypes';


/**
 * Refreshes the list of content type from the cache.
 * @param {boolean} reload Flag requesting to reload the list of content types.
 * @return {Array<Object>} The list of content types.
 */
ContentTypes.prototype.getContentTypes = function (reload) {
  if (reload === true) {
    this.contentTypes_ = this.cma_.get('/content_types').body;
    this.cache_.put(ContentTypes.CT_CACHE, this.contentTypes_);
  }
  return this.contentTypes_;
};



/**
 * Returns the content type using its ID.
 * @private
 * @param  {string} contentTypeId ID of the content type to get.
 * @return {object}               The content type object.
 */
ContentTypes.prototype.getContentTypeById = function (contentTypeId) {
  for (var i = 0; i < this.contentTypes_.items.length; i++) {
    if (this.contentTypes_.items[i].sys.id == contentTypeId) {
      return this.contentTypes_.items[i];
    }
  }
  return null;
};


/**
 * Returns the content type name from its name.
 * @private
 * @param  {string} contentTypeName Name of the content type to get.
 * @return {string}                 Found content type name.
 */
ContentTypes.prototype.getContentTypeByName = function (contentTypeName) {
  for (var i = 0; i < this.contentTypes_.items.length; i++) {
    if (this.contentTypes_.items[i].name == contentTypeName) {
      return this.contentTypes_.items[i];
    }
  }
  return null;
};
