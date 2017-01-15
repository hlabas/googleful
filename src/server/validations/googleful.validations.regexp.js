function RegexpValidation(rule) {
  this.rule_ = rule;
}


RegexpValidation.prototype.buildRule = function(builder, columnRange) {
  var startCellA1 = columnRange.getCell(1, 1).getA1Notation();
  return builder.requireFormulaSatisfied('=REGEXMATCH(' + startCellA1 + ';"^' +
      this.rule_.pattern.replace('"', '""') + '$")');
};
