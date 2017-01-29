function DateValidation(rule) {
  this.rule_ = rule;
}

DateValidation.prototype.buildRule = function(builder, columnRange) {
  return builder.requireDate();
};
