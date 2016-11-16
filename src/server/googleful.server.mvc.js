

var MVC = function () {
  /**
   * White list of controllers.
   */
  this.availControllers_ = [];

  /**
   * Current controller instance.
   */
  this.controller_ = null;
}

/**
 * Adds a given controller name to the accepted list.
 * @param {string} controllerName Name of the controller to whitelist.
 */
MVC.prototype.whiteListController = function (controllerName) {
  this.availControllers_.push(controllerName);
};


/**
 * Invokes an action on a given controller.
 * @param {string} controllerName Name of the controller where the action is
 *     located.
 * @param {string} action Name of the action function to invoke.
 * @param {array} ...params Params to pass through the action function.
 */
MVC.prototype.invoke = function (controllerName, action, params) {
  this.controller_ = this.resolveController_(controllerName);
  if (typeof(this.controller_[action] === 'function')) {
    var action = this.controller_[action];
    action.apply(this.controller_, params);
  }
};


/**
 * Resolves a controller instance by its name.
 * @param {string} controllerName Name of the controller.
 */
MVC.prototype.resolveController_ = function (controllerName) {
  if (this.availControllers_.indexOf(controllerName) === -1) {
    throw new Error('Unknown controller name: ' + controllerName);
  }
  var controllerClass = controllerName + 'Controller';
  return new controllerClass();
};
