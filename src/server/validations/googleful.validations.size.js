function SizeValidation(rule) {
  this.rule_ = rule;
}

SizeValidation.prototype.buildRule = function(builder, columnRange) {
  var startCellA1 = columnRange.getCell(1, 1).getA1Notation();
  if (this.rule_.hasOwnProperty('min') && this.rule_.hasOwnProperty('max')) {
    return builder.requireFormulaSatisfied('=REGEXMATCH(' +
        startCellA1 + ';"^.{' + this.rule_.min + ',' + this.rule_.max + '}$")');
  }
  if (this.rule_.hasOwnProperty('min')) {
    return builder.requireFormulaSatisfied('=REGEXMATCH(' +
        startCellA1 + ';"^.{' + this.rule_.min + ',}$")');
  }
  if (this.rule_.hasOwnProperty('max')) {
    return builder.requireFormulaSatisfied('=REGEXMATCH(' +
        startCellA1 + ';"^.{0,' + this.rule_.max + '}$")');
  }
};
