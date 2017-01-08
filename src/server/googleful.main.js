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
 * Calls a controller action with parameters as an object.
 * @param {string} controller The controller name.
 * @param {string} action The action function to invoke on the controller.
 * @param {object} param The parameters to pass to the action function.
 */
function call(controller, action, params) {
  return mvc().invoke(controller, action, params);
}


/**
 * Passed into the configuration factory constructor
 * @return {googleful.json.Configuration} Default configuration settings.
 */
function getDefaultConfiguration_() {
  return {
    debug: false,
    sheets: {
      debugSpreadsheetId: null
    }
  };
}
