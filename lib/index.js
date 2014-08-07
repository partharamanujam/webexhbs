'use strict';

var handlebars = require('handlebars'),
    engine = require('./engine')(handlebars);

// exports
exports.handlebars = handlebars;
exports.engine = engine;
