var Fields = {

  /**
   * Computes the cell renderer to use depending on the Contentful field type.
   * @param  {Object} field The Contentful field descriptor.
   * @return {FieldRenderer} The cell renderer to use for the field.
   */
  "getFieldRenderer": function (field) {
    switch (field.type) {
      case 'Array':
        return new ArrayRenderer(field.items.type == 'Link' ? field.items.linkType
            : field.items.type);
      case 'Object':
        return new ObjectRenderer();
      case 'Integer':
      case 'Number':
        return new NumberRenderer();
      case 'Link':
        return new LinkRenderer(field.linkType);
      case 'Date':
        return new DateRenderer();
      case 'Location':
        return new LocationRenderer();
    }
    return new StringRenderer();
  },

  "fieldValueToJSON": function (cellValue, field, localeCode) {
    var fieldValue = {};
    var jsonValue = {};
    switch (field.type) {
      case 'Link':
        jsonValue = {
          "sys": {
            "id": cellValue.match(/[^ ]+\: ([a-zA-Z0-9-_.]{1,64})/)[1],
            "linkType": field.linkType,
            "type": "Link"
          }
        };
        break;
      case 'Location':
        var match = cellValue.match(/Lat\: ([0-9.]+) Lon\: ([0-9.]+)/);
        jsonValue = {
          "lat": parseFloat(match[1]),
          "lon": parseFloat(match[2])
        };
        break;
      case 'Array':
        try {
          jsonValue = JSON.parse(cellValue);
        } catch (e) {
          jsonValue = [];
        }
        break;
      case 'Object':
        try {
          jsonValue = JSON.parse(cellValue);
        } catch (e) {
          jsonValue = {
            "error": "Invalid JSON",
            "json": cellValue
          };
        }
        break;
      case 'Integer':
        jsonValue = parseInt(cellValue, 10);
        break;
      case 'Date':
        jsonValue = cellValue.toISOString();
        break;
      case 'Number':
        jsonValue = parseFloat(cellValue);
        break;
      default:
      case 'Boolean':
        jsonValue = cellValue;
        break;
    }
    fieldValue[localeCode] = jsonValue;
    return fieldValue;
  },

  /**
   * Builds a set of validation rules to apply to a column used for rendering a
   * given field.
   * @param  {Object} field      The field for which the validation rules must be
   *                             built.
   * @return {Array<Validation>} The list of validations to use for the column.
   */
  "getValidationRules": function (field) {
    var rules = [];
    if (field.required) {
      rules.push(new RequiredValidation());
    }
    if (field.type === 'Date') {
      rules.push(new DateValidation());
    }
    for (var i = 0; i < field.validations.length; i++) {
      var val = field.validations[i];
      var ruleName = Object.keys(val)[0];
      var rule = val[ruleName];
      switch (ruleName) {
        case 'in':
          rules.push(new InValidation(rule));
          break;
        case 'range':
          rules.push(new RangeValidation(rule));
          break;
        case 'size':
          rules.push(new SizeValidation(rule));
          break;
        case 'regexp':
          rules.push(new RegexpValidation(rule));
          break;
        case 'unique':
          rules.push(new UniqueValidation());
          break;
      }
    }
    return rules;
  }
};
