'use strict';

var handlebars = require('handlebars'),
    handlebars = require('handlebars-layouts')(handlebars),
    engine = require('./engine')(handlebars);

// exports
exports.handlebars = handlebars;
exports.engine = engine;
