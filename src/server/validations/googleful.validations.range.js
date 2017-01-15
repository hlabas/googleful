function RangeValidation(rule) {
  this.rule_ = rule;
}

RangeValidation.prototype.buildRule = function(builder, columnRange) {
  var startCellA1 = columnRange.getCell(1, 1).getA1Notation();
  if (this.rule_.hasOwnProperty('min') && this.rule_.hasOwnProperty('max')) {
    return builder.requireNumberBetween(this.rule_.min, this.rule_.max);
  }
  if (this.rule_.hasOwnProperty('min')) {
    return builder.requireNumberGreaterThanOrEqualTo(this.rule_.min);
  }
  if (this.rule_.hasOwnProperty('max')) {
    return builder.requireNumberLessThanOrEqualTo(this.rule_.max);
  }
};
