# FTA Tariff Formulas

## TL;DR

A utility library for formalising and working with various types of tariff
formulas. To use:

    const formula = TariffFormula.parse('...');
    console.log(formula.signature);
    console.log(formula.quantity);
    console.log(formula.unit);
    console.log(formula.friendly);
    console.log(formula.variables);
    console.log(formula.evaluate(...));

## What

This is an example JavaScript library for parsing tariff formulas
and quantities
served in DFAT Free Trade Agreements Portal Data.

This example module and grammar solves the problem of representation and
reasoning about tariff formulas by machine in a consistent manner.
The grammar is intended to be context-free and described in later section.

## Who

This is intended for engineers who have to encode and use tariff rates and
quantities associated with trade data.

## Where

All tariff rates and quantity data served in FTA Portal API will be able to
be parsed and worked with using this module.

## Why

People in this domain
use a variety of notations to often refer to the same information.
Even the most common and simple case of a tariff percentage.
E.g. a 5% tariff may be represented as percentage,
i.e. "5%," or as a fraction, "0.005," or sometimes there won't be
any units associated with it and it will need to be decoded based on context or
implicit or non-expressed knowledge.
This is not very helpful for machine use of the data and was a problem that
needed to solved to accurately represent tariff commitments.

In terms of applicability, existence and conformance is more important
than specifics of the representation.


## When

This particular example implementation will facilitate JavaScript and
Nodejs users. This is developed to support the examples and use cases
we had to implement to support our services.

Practitioners using other technologies and platforms are encouraged to
treat this as one example implementation and develop their own implementations
as necessary.

## License

The MIT License (MIT)

Copyright (c) 2015-2016
National ICT Australia

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## How to Use

### npm

    npm install tariff-formula

### html

Browserified code is checked into the repository as
[formula.js](https://github.com/AusFTAs/tariff-formula/blob/master/formula.js)

## Grammar

### Alphabet

Use ASCII characters.

### Tokens

  - [0-9]+("."[0-9]+)? is a NUMBER
  - "var_"[a-z0-9_]+ is a VARIABLE
  - ['][^']+['] is a TEXT
  - (minimum|maximum|range) is a FUNCTION
  - ","
  - "u"
  - "+"
  - "-"
  - "*"
  - "/"
  - "^"
  - "%"
  - "("
  - ")"
  - "error"
  - "friendly"

### Rules

    e
        : e '+' e
        | e '-' e
        | e '*' e
        | e '/' e
        | e '^' e
        | e '%' e
        | '-' e %prec UMINUS
        | NUMBER
        | VARIABLE
        | e 'u' TEXT
        | FUNCTION '(' e ',' e ')'
        | '(' e ')'
        | 'error'
        | e 'friendly' TEXT

### Start

e

### Notes

All whitespace characters between terminals are ignored.

Jison is used for implementation. See src/grammar.jison for
more details.

### Examples

  - 5 u '%'
  - 5 u 'usd/item'
  - maximum(minimum(0.05 * var_marker_price, 5) u 'usd/item', 15 u '%')

### Dependencies

    sudo npm install -g babel-cli
    sudo npm install -g browserify
    sudo npm install -g jison
    sudo npm install -g nodemon


## Modification

### Sources

In src folder.

Run

    npm run grammar

to compile jison grammar file into js. I.e. grammar.js


Run

    npm run workDev

 to automatically compile files in src folder into es6 commonjs
 modules in root folder. I.e. index.js and test.js

Run

    npm run browserify

to prepare commonjs files for browser. I.e. formula.js
