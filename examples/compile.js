'use strict';

var path = require('path'),
    waterfall = require('async-waterfall'),
    webexhbs = require('../lib'),
    engine = webexhbs.engine;

var context = {
    title: 'Layout Test',
    items: ['apple', 'orange', 'banana']
};

waterfall(
    [
        function (callback) {
            engine.registerPartial('layout', path.normalize(__dirname + '/partials/layout.hbs'), callback);
        },
        function (callback) {
            engine.compile(path.normalize(__dirname + '/views/home.hbs'), callback);
        },
        function (template, callback) {
            console.log(template(context));
            callback(null);
        }
    ],
    function (err) {
        if (err) {
            console.error('An error occurred!');
        }
    }
);