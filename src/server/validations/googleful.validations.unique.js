function UniqueValidation(rule) {
  this.rule_ = rule;
}


UniqueValidation.prototype.buildRule = function(builder, columnRange) {
  var startCellA1 = columnRange.getCell(1, 1).getA1Notation();
  return builder.requireFormulaSatisfied('=COUNTIF(' + columnRange.getA1Notation() + ';' + startCellA1 + ') < 2');
};
