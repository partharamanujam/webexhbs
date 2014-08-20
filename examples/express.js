'use strict';

var path = require('path'),
    express = require('express'),
    waterfall = require('async-waterfall'),
    webexhbs = require('../lib'),
    engine = webexhbs.engine;

var app;
var homeData = {
    title: 'Layout Test',
    items: ['apple', 'orange', 'banana']
};

engine.enableLogging();

waterfall(
    [
        function (callback) {
            engine.registerPartialsDir(path.normalize(__dirname + '/partials'), callback);
        },
        function (callback) {
            engine.registerViewsDir(path.normalize(__dirname + '/views'), callback);
        },
        function (callback) {
            app = express();

            app.set('view engine', 'hbs');
            app.engine('hbs', webexhbs.engine.renderFile);
            app.set('views', path.normalize(__dirname + '/views'));

            app.get('/server', function (req, res) {
                res.render('home', homeData);
            });

            app.listen(8080);
        }
    ],
    function (err) {
        if (err) {
            console.error('An error occurred!');
        }
    });

// access /server from browser