// Copyright 2017 Contentful GmbH. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/**
 * Called when an add-on is installed.
 * @param {Object} e Apps Script onInstall event object
 */
function onInstall(e) {
  onOpen(e);
}


/**
 * The MVC object that runs the server-side code logic.
 */
function mvc() {
  var mvc = new MVC();
  mvc.whiteListController('Configuration', ConfigurationController);
  mvc.whiteListController('Home', HomeController);
  return mvc;
}

/**
 * Called when a spreadsheet that is associated with this add-on is opened.
 * @param {Object} e Apps Script onInstall event object
 */
function onOpen(e) {
  var addonMenu = SpreadsheetApp.getUi().createAddonMenu();
  addonMenu.addItem('Configuration', 'onConfiguration');
  addonMenu.addToUi();
}


function onConfiguration() {
  mvc().invoke('Configuration', 'showView');
}

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('googleful.ui.authcallback');
}

function onShowSidebar() {
  // var contentful = new Contentful();
  // var ctrl = null;
  // if (!contentful.hasAccess()) {
  //   ctrl = 'Configuration';
  // } else {
  //   ctrl = 'Home';
  // }
  // mvc().invoke(ctrl, 'showView');
}
