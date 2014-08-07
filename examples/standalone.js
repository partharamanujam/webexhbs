'use strict';

var fs = require('fs'),
    path = require('path'),
    webexhbs = require('../lib');

var hbs, template, output;

// get handlebars instance
hbs = webexhbs.engine.getInstance();

// regsiter partial
hbs.registerPartial('layout', fs.readFileSync(path.normalize(__dirname + '/layout.hbs'), 'utf8'));

// compile template
template = hbs.compile(fs.readFileSync(path.normalize(__dirname + '/home.hbs'), 'utf8'));

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
