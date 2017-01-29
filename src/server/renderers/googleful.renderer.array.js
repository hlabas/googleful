function ArrayRenderer(itemsType) {
  this.itemsType_ = itemsType;
}

ArrayRenderer.prototype.renderValue = function(fieldValue) {
  // TODO: figure out a way to show exploitable data without compromising
  // serialization used to push changes back to Contentful.
  return JSON.stringify(fieldValue);

  // if (!Array.isArray(fieldValue)) {
  //   return 'ERROR';
  // }
  // if (fieldValue.length === 0) {
  //   return '';
  // }
  // if (fieldValue.length === 1) {
  //   if (this.itemsType_ === 'Symbol') {
  //     return fieldValue[0];
  //   }
  //   return this.itemsType_ + ': ' + fieldValue[0].sys.id;
  // }
  // switch (this.itemsType_) {
  //   case 'Asset':
  //     return this.pluralize_(fieldValue.length, ' asset');
  //   case 'Entry':
  //     return this.pluralize_(fieldValue.length, ' entry', ' entries');
  // }
  // return '"' + fieldValue.join('", "') + '"';
};

ArrayRenderer.prototype.formatColumn = function(range) {
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

ArrayRenderer.prototype.pluralize_ = function(size, text, plural) {
  return size + (size > 1 ? (plural ? plural : text + 's') : text);
};
