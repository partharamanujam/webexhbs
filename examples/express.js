'use strict';

var fs = require('fs'),
    path = require('path'),
    express = require('express'),
    webexhbs = require('../lib');

var hbs, app;
var pageData = {
    title: 'Layout Test',
    items: [
        'apple',
        'orange',
        'banana'
    ]
};

// get handlebars instance
hbs = webexhbs.engine.getInstance();

// regsiter partial
hbs.registerPartial('layout', fs.readFileSync(path.normalize(__dirname + '/layout.hbs'), 'utf8'));

app = express();

app.set('view engine', 'hbs');
app.engine('hbs', webexhbs.engine.renderFile);
app.set('views', path.normalize(__dirname));

app.get('/', function(req, res) {
    res.render('home', pageData);
});

app.listen(8080);

// access / from browser
