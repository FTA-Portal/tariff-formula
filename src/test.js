"use strict";

var formula = require("./index");
var assert = require("assert");

var cases = [{
  input: "0.0",
  signature: "q",
  quantity: "0.0",
  friendly: "0",
  variables: {},
  evaluate: {
    quantity: 0
  }
}, {
  input: "1.1 u '%'",
  signature: "qu",
  quantity: "1.1",
  unit: '%',
  friendly: "1.1%",
  variables: {
    "units": "Number of units",
    "unit_price": "Price per unit"
  },
  evaluate: {
    "quantity": 0.011000000000000001,
    "units": ""
  }
}, {
  input: "1.1 u 'head'",
  signature: "qu",
  quantity: "1.1",
  unit: 'head',
  friendly: "1.1 heads",
  variables: {
    "units": "Number of heads"
  },
  evaluate: {
    "quantity": 1.1,
    "units": "head"
  }
}, {
  input: "1.1 u 'yen/item'",
  signature: "qu",
  quantity: "1.1",
  unit: 'yen/item',
  friendly: "1.1 yen/item",
  variables: {
    "units": "Number of item"
  },
  evaluate: {
    "quantity": 1.1,
    "units": "yen"
  }
}, {
  input: "error friendly '13.0% or 34won/min(at standard speed)'",
  signature: "e",
  quantity: undefined,
  unit: undefined,
  friendly: "13.0% or 34won/min(at standard speed)",
  variables: {},
  evaluate: {
    "error": "error",
    "friendly": "13.0% or 34won/min(at standard speed)"
  }
}, {
  input: "minimum(401.65 u 'yen/kg' - var_value_for_customs_duty u 'yen/kg', 361 u 'yen/kg')",
  signature: "m(qu-vu,qu)",
  quantity: undefined,
  unit: undefined,
  friendly: "minimum of (401.65 yen/kg minus value for customs duty) and 361 yen/kg",
  variables: {
    "units": "Number of kg",
    "value_for_customs_duty": ""
  },
  evaluate: {
    "units": "yen",
    "quantity": 361
  }
}, {
  input: "(var_standard_import_price_of_processed_pig * 1.5 - var_value_for_customs_duty * 0.6) u 'yen/kg'",
  signature: "(v*q-v*q)u",
  quantity: undefined,
  unit: 'yen/kg',
  friendly: '((standard import price of processed pig multiplied by 1.5) minus (value for customs duty multiplied by 0.6)) yen/kg',
  variables: {
    "units": "Number of kg",
    "standard_import_price_of_processed_pig": "",
    "value_for_customs_duty": ""
  },
  evaluate: {
    "units": "yen",
    "quantity": 0.9
  }
}, {
  input: "range(5.6 u '%', 6.5 u '%')",
  signature: "r(qu,qu)",
  quantity: undefined,
  unit: undefined,
  friendly: "from 5.6% to 6.5%",
  variables: {
    units: 'Number of units',
    unit_price: 'Price per unit'
  },
  evaluate: {
    "units": "",
    "operation": "range",
    "group": [{
      "quantity": 0.055999999999999994,
      "units": ""
    }, {
      "quantity": 0.065,
      "units": ""
    }]
  }
}, {
  input: "maximum(minimum(15 u '%' , 125 u 'yen/l'), 67 u 'yen/l')",
  signature: "M(m(qu,qu),qu)",
  quantity: undefined,
  unit: undefined,
  friendly: "maximum of (minimum of 15% and 125 yen/l) and 67 yen/l",
  variables: {
    units: 'Number of l',
    unit_price: 'Price per unit'
  },
  evaluate: {
    "units": "yen",
    "quantity": 67
  }
}, {
  input: "0.0001 u 'usd/litre'",
  signature: "qu",
  quantity: "0.0001",
  unit: 'usd/litre',
  friendly: "0.0001 usd/litre",
  variables: {
    "units": "Number of litre"
  },
  evaluate: {
    "quantity": 0.0001,
    "units": "usd"
  }
}, {
  input: "0.00010 u 'usd/litre'",
  signature: "qu",
  quantity: "0.00010",
  unit: 'usd/litre',
  friendly: "0.0001 usd/litre",
  variables: {
    "units": "Number of litre"
  },
  evaluate: {
    "quantity": 0.00010,
    "units": "usd"
  }
}];

cases.forEach(function (case_) {
  try {
    console.log('input text:', case_.input);
    var parsed = formula.parse(case_.input);
    var tree = JSON.stringify(parsed, null, 2);
    var dumped = parsed.dump();
    assert.equal(dumped.replace(/\s/g, ''), case_.input.replace(/\s/g, ''), 'dumped mismatch ' + JSON.stringify(dumped) + " from " + tree);
    var signature = parsed.signature;
    assert.equal(signature, case_.signature, "signature mismatch " + JSON.stringify(signature, null, 2) + " from " + tree);
    var unit = parsed.unit;
    assert.equal(unit, case_.unit, "unit mismatch " + JSON.stringify(unit, null, 2) + " from " + tree);
    var quantity = parsed.quantity;
    assert.equal(quantity, case_.quantity, "quantity mismatch " + JSON.stringify(quantity, null, 2) + " from " + tree);
    var friendly = parsed.friendly;
    assert.equal(friendly, case_.friendly, "friendly mismatch " + JSON.stringify(friendly, null, 2) + " from " + tree);
    var variables = parsed.variables;
    assert.deepEqual(variables, case_.variables, "variables mismatch " + JSON.stringify(variables, null, 2) + " from " + tree);
    Object.keys(variables).sort().forEach(function (k, i) {
      variables[k] = 1;
    });
    var evaluate = parsed.evaluate(variables);
    assert.deepEqual(evaluate, case_.evaluate, "evaluate mismatch " + JSON.stringify(evaluate) + " from " + tree);
  } catch (e) {
    console.error('XX', tree, e, e.stack);
  }
});
