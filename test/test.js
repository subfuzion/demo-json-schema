var assert = require('assert');
var tv4 = require('tv4');
var ZSchema = require('z-schema');
var jsb = require('json-schema-builder');

var tv4Factory = function (schema, options) {
  return {
    validate: function (json) {
      try {
        var valid = tv4.validate(json, schema);
        return valid ? { valid: true } : { valid: false, errors: [ tv4.error ] };
      } catch (err) {
        return { valid: false, errors: [err.message] };
      }
    }
  };
};

var zschemaFactory = function (schema, options) {
  var zschema = new ZSchema(options);

  return {
    validate: function (json) {
      try {
        var valid = zschema.validate(json, schema);
        return valid ? { valid: true } : { valid: false, errors: zschema.getLastErrors() };
      } catch (err) {
        return { valid: false, errors: [err.message] };
      }
    }
  };
};

it ('should validate a simple integer instance', function() {

  var schema = {
    "type": "integer"
  };

  var data = 5;

  var validator = zschemaFactory(schema);

  var result = validator.validate(data);

  assert.equal(result.valid, true);

});

it ('should validate a simple string instance', function() {

  var schema = {
    "type": "string"
  };

  var data = "foo";

  var validator = zschemaFactory(schema);

  var result = validator.validate(data);

  assert.equal(result.valid, true);

});

it ('should not validate a number instance when a string is expected', function() {

  var schema = {
    "type": "string"
  };

  var data = 5;

  var validator = tv4Factory(schema);

  var result = validator.validate(data);

  assert.equal(result.valid, false);

});

it ('should validate string with minLength', function() {

  var schema = {
    "type": "string",
    "minLength": 3
  };

  var data = "foo";

  var validator = tv4Factory(schema);

  var result = validator.validate(data);

  assert.equal(result.valid, true);

});

it ('should not validate string that does not match minLength', function() {

  var schema = {
    "type": "string",
    "minLength": 4
  };

  var data = "foo";

  var validator = tv4Factory(schema);

  var result = validator.validate(data);

  assert.equal(result.valid, false);

});

it ('should allow foo property with any value', function() {

  var schema = {
    "properties": {
      "foo": {}
    }
  };

  var data1 = {
    "foo": "bar"
  }

  var data2 = {
    "foo": 3
  }

  var validator = tv4Factory(schema);

  var result = validator.validate(data1);
  assert.equal(result.valid, true);

  result = validator.validate(data2);
  assert.equal(result.valid, true);

});

it ('should allow foo property with only string values', function() {

  var schema = {
    "type": "object",
    "properties": {
      "foo": { "type": "string" }
    }
  };

  var data1 = {
    "foo": "bar"
  }

  var data2 = {
    "foo": 3
  }

  var validator = tv4Factory(schema);

  var result = validator.validate(data1);
  assert.equal(result.valid, true);

  result = validator.validate(data2);
  assert.equal(result.valid, false);

});

it ('should allow foo property with only string values using json-schema-builder', function() {

  var schema = jsb.object().property('foo', jsb.string()).json();

  var data1 = {
    "foo": "bar"
  }

  var data2 = {
    "foo": 3
  }

  var validator = tv4Factory(schema);

  var result = validator.validate(data1);
  assert.equal(result.valid, true);

  result = validator.validate(data2);
  assert.equal(result.valid, false);

});

it ('should validate if required property is missing', function() {

  var schema = {
    "type": "object",
    "properties": {
      "foo": { "type": "string" }
    },
    "required": [ "foo" ]
  };

  var data1 = {
    "foo": "bar"
  }

  var data2 = {
    "bar": "foo"
  }

  var validator = tv4Factory(schema);

  var result = validator.validate(data1);
  assert.equal(result.valid, true);

  result = validator.validate(data2);
  assert.equal(result.valid, false);

});

it ('should validate if required property is missing using json-schema-builder', function() {

  var schema = jsb.object().property('foo', jsb.string(), true).json();

  var data1 = {
    "foo": "bar"
  }

  var data2 = {
    "bar": "foo"
  }

  var validator = tv4Factory(schema);

  var result = validator.validate(data1);
  assert.equal(result.valid, true);

  result = validator.validate(data2);
  assert.equal(result.valid, false);

});

