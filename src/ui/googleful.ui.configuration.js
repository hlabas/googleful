var CTRL = 'Configuration';

function save() {
  var tokenValue = $('#token').val();
  if (nullOrEmpty(tokenValue)) {
    confirm('Invalid token value.');
  }
  google.script.run
      .withSuccessHandler(saveSuccess)
      .call(CTRL, 'saveConfig', [
        {
          "token": tokenValue
        }
      ]);
}

function saveSuccess() {
  confirm('Configuration was successfully saved!');
}
