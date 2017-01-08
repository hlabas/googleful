
var MVCTests = function() {
  Tests.call(this);
};
inherit_(MVCTests, Tests);


MVCTests.prototype.testInvoke = function () {
  var Test = function () {};
  Test.prototype.testSimpleAction = function () {
    return true;
  };
  Test.prototype.testSimpleParamAction = function (variable) {
    return variable;
  };
  var mvc = new MVC();
  mvc.whiteListController('Test', Test);
  var result = mvc.invoke('Test', 'testSimpleAction');
  assertEquals_(true, result);
  result = mvc.invoke('Test', 'testSimpleParamAction', ['test']);
  assertEquals_('test', result);
};
