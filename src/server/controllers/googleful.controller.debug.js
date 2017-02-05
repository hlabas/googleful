function DebugController() {

}

DebugController.prototype.showView = function () {

};

DebugController.prototype.flagEdited = function () {
  Logger.log('Faking trigger:');
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var cell = sheet.getActiveCell();
  var triggerEvent = {
    "user": 'temp@temp.com',
    "source": sheet,
    "range": cell,
    "value": cell.getValue(),
    "authMode": ScriptApp.AuthMode.LIMITED
  };
  Logger.log(triggerEvent);
  onEdit(triggerEvent);
  return new EditingController().getEditedEntries();
};


DebugController.prototype.pushChanges = function () {
  return new EditingController().pushChanges();
};
