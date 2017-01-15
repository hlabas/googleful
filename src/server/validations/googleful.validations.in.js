function InValidation(rule) {
  this.rule_ = rule;
}


InValidation.prototype.buildRule = function(builder, columnRange) {
  return builder.requireValueInList(this.rule_);
};
