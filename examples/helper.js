'use strict';

var path = require('path'),
    waterfall = require('async-waterfall'),
    webexhbs = require('../lib'),
    handlebars = webexhbs.handlebars,
    engine = webexhbs.engine;

var context = {
    items: [
        {
            name: "Handlebars",
            emotion: "love"
        },
        {
            name: "Mustache",
            emotion: "enjoy"
        },
        {
            name: "Ember",
            emotion: "want to learn"
        }
    ]
};

waterfall(
    [
        function (callback) {
            engine.registerHelper('agree_button',
                function () {
                    return new handlebars.SafeString(
                        "<button>I agree. I " + this.emotion + " " + this.name + "</button>"
                    );
                }, callback);
        },
        function (callback) {
            engine.compile(path.normalize(__dirname + '/partials/agree.hbs'), callback);
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