

var MVC = function () {
  /**
   * White list of controllers.
   */
  this.availControllers_ = {};

  /**
   * Current controller instance.
   */
  this.controller_ = null;
};

/**
 * Adds a given controller name to the accepted list.
 * @param {string} controllerName Controller name.
 * @param {Function} controller Controller constructor function to whitelist.
 */
MVC.prototype.whiteListController = function (controllerName, controller) {
  this.availControllers_[controllerName] = controller;
};


/**
 * Invokes an action on a given controller. Action function parameters can be
 * added after the 2nd parameter.
 * @param {string} controllerName Name of the controller where the action is
 *     located.
 * @param {string} action Name of the action function to invoke.
 * @param {Array} params Parameters to pass to the action function.
 */
MVC.prototype.invoke = function (controllerName, action, params) {
  this.controller_ = this.resolveController_(controllerName);
  if (typeof(this.controller_[action] === 'function')) {
    var actionFunction = this.controller_[action];
    return actionFunction.apply(this.controller_, params);
  }
  return null;
};


/**
 * Resolves a controller instance by its name.
 * @param {string} controllerName Name of the controller.
 */
MVC.prototype.resolveController_ = function (controllerName) {
  if (!this.availControllers_.hasOwnProperty(controllerName)) {
    throw new Error('Unknown controller name: ' + controllerName);
  }
  var controllerClass = this.availControllers_[controllerName];
  return new controllerClass();
};
