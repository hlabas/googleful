
var ContentfulTests = function() {
  var props = PropertiesService.getUserProperties();
  props.deleteProperty('spaceId');
  props.deleteProperty('authToken');
  Tests.call(this);
};
inherit_(ContentfulTests, Tests);


ContentfulTests.prototype.testConfigSpaceId = function () {
  try {
    var ctfl = new Contentful();
  } catch (e) {
    assertEquals_('No space ID provided', e.message);
  }
};


ContentfulTests.prototype.testHasAccess = function () {
  var ctfl = new Contentful('1234567890');
  assertFalse_(ctfl.hasAccess());
};
