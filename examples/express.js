'use strict';

var path = require('path'),
    express = require('express'),
    webexhbs = require('../lib'),
    engine = webexhbs.engine;

var app;
var pageData = {
    title: 'Layout Test',
    items: ['apple', 'orange', 'banana']
};

// enable logging
engine.enableLogging();

// regsiter partials from dir
engine.registerPartialsDir(path.normalize(__dirname + '/partials'),
    function (err) {
        if (err) {
            console.error('An error occurred!');
            return;
        }
        // now run the express-app
        app = express();

        app.set('view engine', 'hbs');
        app.engine('hbs', webexhbs.engine.renderFile);
        app.set('views', path.normalize(__dirname + '/views'));

        app.get('/', function (req, res) {
            res.render('home', pageData);
        });

//        app.get('/handlebars.runtime.js', function (req, res) {
//            engine.sendBrowserRuntime(res);
//        });

        app.listen(8080);
    }
);

// access / from browser