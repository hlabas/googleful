function RequiredValidation(rule) {
  this.rule_ = rule;
}


RequiredValidation.prototype.buildRule = function(builder, columnRange) {
  var startCellA1 = columnRange.getCell(1, 1).getA1Notation();
  return builder.requireFormulaSatisfied('=REGEXMATCH(' + startCellA1 + ';"^.+$")');
};
