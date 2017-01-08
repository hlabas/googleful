var CTRL = 'Configuration';

function saveAppConfig() {
  var errorMsg = '';
  var config = {};
  config.clientId = $('#uid').val();
  if (nullOrEmpty(config.clientId)) {
    errorMsg += errorMsg ? '<br>' : 'Invalid UID value.';
  }
  config.clientSecret = $('#secret').val();
  if (nullOrEmpty(config.clientSecret)) {
    errorMsg += errorMsg ? '<br>' : 'Invalid client secret value.';
  }
  if (errorMsg) {
    error(errorMsg);
  } else {
    google.script.run
        .withSuccessHandler(saveAppSuccess)
        .call(CTRL, 'saveAppConfig', [config]);
  }
}

function saveAppSuccess(result) {
  if (result) {
    confirm('The app settings were successfully saved! ' +
        'You must now authorize it to finish the configuration process.');

    // Toggle authorization link
    $('#auth-link').attr('href', result);
    $('#app-settings').hide();
    $('#authorization').show();
    $('#reset-config').enable();
  } else {
    error('The provided configuration is invalid or could not be saved.');
  }
}

function authClick() {
  $('#auth-link').hide();
  $('#check-auth').show();
}

function showToken() {
  $('#auth-token').text('Fetching...');
  google.script.run
      .withSuccessHandler(function (tok) {
        $('#auth-token').text(tok);
      })
      .call(CTRL, 'getToken');
}

function hideAuth() {
  $('#authorization').hide();
}

function saveSpaceConfig() {
  var errorMsg = '';
  var config = {};
  config.spaceId = $('#space').val();
  if (nullOrEmpty(config.spaceId)) {
    errorMsg += errorMsg ? '<br>' : 'Invalid space ID value.';
  }
  if (errorMsg) {
    error(errorMsg);
  } else {
    google.script.run
        .withSuccessHandler(saveSpaceSuccess)
        .call(CTRL, 'saveSpaceConfig', [config]);
  }
}

function saveSpaceSuccess(result) {
  if (result) {
    confirm('Space ID was successfully configured!');
  } else {
    error('The provided configuration is invalid or could not be saved.');
  }
}


function resetConfig() {
  google.script.run
      .withSuccessHandler(resetSuccess)
      .call(CTRL, 'resetConfig');
}

function resetSuccess() {
  $('#uid').val('');
  $('#secret').val('');
  $('#space').val('');
  $('#configuration').show();
  $('#auth').hide();
  $('#reset-config').disable();
}
