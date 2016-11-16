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
  configuration.sheets.debugSpreadsheetId =
      '1D58qeqUIdYgbroLjlzfwQjtFsiOhwOSMxn_TvmxvJgk';
  return configuration;
}
