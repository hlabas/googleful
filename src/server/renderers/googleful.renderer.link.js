function LinkRenderer(linkType) {
  this.linkType_ = linkType;
}

LinkRenderer.prototype.renderValue = function(fieldValue) {
  return this.linkType_ + ': ' + fieldValue.sys.id;
};

LinkRenderer.prototype.formatColumn = function(range) {
  range.setFontStyle('italic').setFontColor('#444444');
  var protection = range.protect()
      .setDescription('Editing references is disabled');

   // Ensure the current user is an editor before removing others. Otherwise, if the user's edit
   // permission comes from a group, the script will throw an exception upon removing the group.
   var me = Session.getEffectiveUser();
   protection.addEditor(me);
   protection.removeEditors(protection.getEditors());
  //  if (protection.canDomainEdit()) {
  //    protection.setDomainEdit(false);
  //  }
};
