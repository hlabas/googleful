// Copyright 2013 Google Inc. All Rights Reserved.
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

// For testing - broadens the OAuth scope to allow opening any
// Spreadsheet on the current user's Drive
/** @NotOnlyCurrentDoc */


/**
 * @param {googleful.json.Configuration} configuration
 *     The current configuration settings.
 * @return {googleful.json.Configuration} configuration
 *     The current configuration settings, updated with test settings.
 */
 function provideEnvironmentConfiguration_(configuration) {
  configuration.sheets.debugSpreadsheetId = '1NAVDpnAM5pvBGS342nMkMXSQ9YGFN9gWJRVYWudKkdE';
  // Web app ID used for the redirect URI of the OAuth flow.
  configuration.appId = 'AKfycbzhTBw-a7rqfmdqZ3cu2scfsk4HGxqYKb4uxc8HlWw';
  return configuration;
}
