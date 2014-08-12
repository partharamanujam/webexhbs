'use strict';

var fs = require('fs'),
    path = require('path'),
    webexhbs = require('../lib'),
    handlebars = webexhbs.handlebars;

var template, output;

// regsiter partial
handlebars.registerPartial('layout', fs.readFileSync(path.normalize(__dirname + '/partials/layout.hbs'), 'utf8'));

// compile template
template = handlebars.compile(fs.readFileSync(path.normalize(__dirname + '/views/home.hbs'), 'utf8'));

// render template
output = template({
    title: 'Layout Test',
    items: [
        'apple',
        'orange',
        'banana'
    ]
});

console.log(output);
