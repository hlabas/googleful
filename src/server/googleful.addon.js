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
  var config = Configuration.getCurrent();
  if (!config.debug) {
    setupTriggers();
  }
  onOpen(e);
}

/**
 * Sets up triggers to handle changes propagation to Contentful.
 */
function setupTriggers() {
  var sheetLib = new SheetsUtilitiesLibrary(Configuration.getCurrent());
  var sheet = sheetLib.getCurrentActiveSpreadsheet();
  ScriptApp.newTrigger('onEdit')
    .forSpreadsheet(sheet)
    .onEdit()
    .create();
}

/**
 * Edit trigger.
 */
function onEdit(e) {
  mvc().invoke('Editing', 'onEditTrigger', [e]);
}

/**
 * The MVC object that runs the server-side code logic.
 */
function mvc() {
  var mvc = new MVC();
  mvc.whiteListController('Configuration', ConfigurationController);
  mvc.whiteListController('Home', HomeController);
  mvc.whiteListController('AuthCallback', AuthCallbackController);
  mvc.whiteListController('Editing', EditingController);
  mvc.whiteListController('Debug', DebugController);
  return mvc;
}

/**
 * Called when a spreadsheet that is associated with this add-on is opened.
 * @param {Object} e Apps Script onInstall event object
 */
function onOpen(e) {
  var addonMenu = SpreadsheetApp.getUi().createMenu('Contentful');
  addonMenu.addItem('Configuration', 'onConfiguration');
  addonMenu.addItem('Contentful panel', 'onShowSidebar');
  addonMenu.addToUi();
}

function onConfiguration() {
  mvc().invoke('Configuration', 'showView');
}

function onShowSidebar() {
  mvc().invoke('Home', 'showView');
}

function doGet(e) {
  return mvc().invoke('AuthCallback', 'showView');
}
