'use strict';

var fs = require('fs'),
    path = require('path'),
    webexhbs = require('../lib'),
    engine = webexhbs.engine;

// get handlebars instance
var hbs = engine.getInstance();

// regsiter partial
hbs.registerPartial('layout', fs.readFileSync(path.normalize(__dirname + '/layout.hbs'), 'utf8'));

// precompile template
engine.precompile(path.normalize(__dirname + '/home.hbs'), function (err, spec) {
    engine.template(spec, function (err, template) {
        var output = template({
            title: 'Layout Test',
            items: [
                'apple',
                'orange',
                'banana'
            ]
        });
        console.log(output);
    });
});
