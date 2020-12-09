/**
 * @file Tariffs Formula Module
 *
 * @author Nahid Akbar
 * @year 2015
 * @copyright National ICT Australia (NICTA). All rights reserved.
 */

"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var grammar = require("./grammar");
var pluralize = require("pluralize");

var dumpHelper = function dumpHelper(tree) {
  var suffix = '';

  if (tree.friendly) suffix = ' friendly \'' + tree.friendly + '\'' + suffix;

  if (tree.units) suffix = " u '" + tree.units + "'" + suffix;

  if (tree.quantity) return tree.quantity + suffix;

  if (tree.operation) {
    switch (tree.operation) {
      case '+':
      case '-':
      case '*':
      case '/':
        return tree.group.map(dumpHelper).join(' ' + tree.operation + ' ') + suffix;
      case 'minimum':
      case 'maximum':
      case 'range':
        return tree.operation + '(' + tree.group.map(dumpHelper).join(', ') + ')' + suffix;
    }
  }

  if (tree.variable) return 'var_' + tree.variable + suffix;

  if (tree.error) return 'error' + suffix;

  if (tree.group) return "(" + tree.group.map(dumpHelper).join('') + ')' + suffix;

  console.error(tree);
};

var signatureHelper = function signatureHelper(tree) {
  var suffix = '';

  if (tree.units) suffix = 'u';

  if (tree.quantity) return 'q' + suffix;

  if (tree.operation) {
    switch (tree.operation) {
      case '+':
      case '-':
      case '*':
      case '/':
        return tree.group.map(signatureHelper).join(tree.operation) + suffix;
      case 'minimum':
      case 'maximum':
      case 'range':
        return {
          'minimum': 'm',
          'maximum': 'M',
          'range': 'r'
        }[tree.operation] + "(" + tree.group.map(signatureHelper).join(',') + ")" + suffix;
    }
  }

  if (tree.variable) return 'v' + suffix;

  if (tree.error !== undefined) return 'e' + suffix;

  if (tree.group) return "(" + tree.group.map(signatureHelper).join('') + ')' + suffix;

  console.error('ERRIR SUGBATYRE', tree);
};

var unitHelper = function unitHelper(tree) {
  if (tree.units) {
    return tree.units;
  } else {
    return undefined;
  }
};

var quantityHelper = function quantityHelper(tree) {
  if (tree.quantity) {
    try {
      return parseFloat(tree.quantity);
    } catch (e) {
      return tree.quantity;
    }
  } else {
    return undefined;
  }
};

var friendlyOperators = {
  '+': 'plus',
  '-': 'minus',
  '*': 'multiplied by',
  '/': 'divided by'
};

var numberFormatHelper = function numberFormatHelper(number) {
  try {
    return Number(number).toString();
  } catch (e) {
    return number + '';
  }
};

var friendlyHelper = function friendlyHelper(tree, level) {
  var prefix = '';
  var suffix = '';
  level = level || 0;

  if (tree.friendly) return tree.friendly;

  if (tree.units) {
    if (tree.units === "%") {
      suffix = '' + tree.units + suffix;
    } else {
      if (tree.units.match(/^aud\/?.*/) && tree.quantity) {
        prefix = '$';
        suffix = '' + tree.units.substr(3) + ' ' + suffix;
      } else {
        if (tree.quantity && tree.quantity === 1 || !tree.units.match(/^[a-z ]+$/)) {
          suffix = ' ' + tree.units + ' ' + suffix;
        } else {
          suffix = ' ' + pluralize(tree.units) + ' ' + suffix;
        }
      }
    }
  }

  if (tree.quantity) {
    return (prefix + numberFormatHelper(tree.quantity) + suffix).replace(/^\s+|\s+$/g, '');
  }

  if (tree.operation) {
    var group = tree.group.map(function (item) {
      var sig = signatureHelper(item);
      if (sig == 'qu' || sig == 'vu' || sig == 'v' || sig == 'q') {
        return friendlyHelper(item, level + 1);
      } else {
        return '(' + friendlyHelper(item, level + 1) + ')';
      }
    });
    switch (tree.operation) {
      case '+':
      case '-':
      case '*':
      case '/':
        return (group.join(' ' + friendlyOperators[tree.operation] + ' ') + suffix).replace(/^\s+|\s+$/g, '');
      case 'minimum':
      case 'maximum':
        return (tree.operation + ' of ' + group.join(' or ') + '' + suffix).replace(/^\s+|\s+$/g, '');
      case 'range':
        return ('from ' + tree.group.map(friendlyHelper).join(' to ') + '' + suffix).replace(/^\s+|\s+$/g, '');
    }
  }

  if (tree.variable) return '' + tree.variable.replace(/_/g, ' ') + '';

  if (tree.error) return ('error' + suffix).replace(/^\s+|\s+$/g, '');

  if (tree.group) return ("(" + tree.group.map(friendlyHelper).join('') + ')' + suffix).replace(/^\s+|\s+$/g, '');

  console.error(error);
};

var variablesHelper = function variablesHelper(tree, vars) {
  var allvars = vars || {};

  if (tree.units) {
    if (tree.units === "%") {
      allvars['units'] = 'Number of units';
      allvars['unit_price'] = 'Price per unit';
    } else if (tree.units.indexOf('/') != -1) {
      allvars['units'] = 'Number of ' + tree.units.substr(tree.units.indexOf('/') + 1);
      // allvars['unit_price'] = 'Price per ' +
      // tree.units.substr(tree.units.indexOf('/') + 1) + ' in ' +
      // tree.units.substr(0, tree.units.indexOf('/'));
    } else {
      allvars['units'] = 'Number of ' + pluralize(tree.units);
    }
  }

  if (tree.variable) {
    allvars[tree.variable] = '';
  } else if (tree.group) {
    tree.group.forEach(function (piece) {
      variablesHelper(piece, allvars);
    });
  }

  return allvars;
};

var evaluateHelper = function evaluateHelper(tree, variables) {
  var result = {
    units: tree.units
  };
  if (!result.units) {
    delete result.units;
  }
  if (tree.variable) {
    result.quantity = parseFloat(variables[tree.variable]);
  } else if (tree.group) {
    var group = tree.group.map(function (c) {
      return evaluateHelper(c, variables);
    });
    if (!result.units) {
      result.units = group[0] && group[0].units || group[1] && group[1].units;
    }

    if (tree.operation) {
      switch (tree.operation) {
        case '+':
          result.quantity = group[0].quantity + group[1].quantity;
          break;
        case '-':
          result.quantity = group[0].quantity - group[1].quantity;
          break;
        case '*':
          result.quantity = group[0].quantity * group[1].quantity;
          break;
        case '/':
          result.quantity = group[0].quantity / group[1].quantity;
          break;
        case 'minimum':
          result.quantity = Math.min(group[0].quantity, group[1].quantity);
          break;
        case 'maximum':
          result.quantity = Math.max(group[0].quantity, group[1].quantity);
          break;
        case 'range':
          result.operation = 'range';
          result.group = group;
          break;
        default:
          console.error('ERROR evaluate operator', tree, variables);
      }
    } else if (group.length == 1) {
      result.quantity = group[0].quantity;
    }
  } else if (tree.quantity) {
    result.quantity = parseFloat(tree.quantity);
  } else if (tree.error) {
    return tree;
  } else {
    console.error('ERROR evaluate', tree, variables);
  }

  if (result.quantity && tree.units) {
    if (tree.units == '%') {
      result.quantity = parseFloat(parseFloat(variables.units) * parseFloat(variables.unit_price) * parseFloat(result.quantity) / 100);
      result.units = '';
    } else if (tree.units.indexOf('/') != -1) {
      result.quantity = parseFloat(parseFloat(variables.units) /* parseFloat(variables.unit_price) */ * parseFloat(result.quantity));
      result.units = tree.units.substr(0, tree.units.indexOf('/'));
    }
  }

  return result;
};

var Formula = function () {
  function Formula(text) {
    _classCallCheck(this, Formula);

    this.tree = grammar.parse(text);
    this.signature = signatureHelper(this.tree);
    this.quantity = quantityHelper(this.tree);
    this.unit = unitHelper(this.tree);
    this.friendly = friendlyHelper(this.tree);
    this.variables = variablesHelper(this.tree);
  }

  _createClass(Formula, [{
    key: "dump",
    value: function dump() {
      return dumpHelper(this.tree);
    }
  }, {
    key: "evaluate",
    value: function evaluate(values) {
      return evaluateHelper(this.tree, values);
    }
  }], [{
    key: "parse",
    value: function parse(text) {
      return new Formula(text);
    }
  }]);

  return Formula;
}();

;

module.exports = Formula;