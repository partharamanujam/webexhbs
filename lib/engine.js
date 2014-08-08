'use strict';

var fs = require('fs'),
    waterfall = require('async-waterfall');

module.exports = function engine(handlebars) {
    var mod = {};
    var instance = handlebars.create();
    require('handlebars-layouts')(instance);

    function getInstance() {
        return instance;
    }
    mod.getInstance = getInstance;

    function compile(filepath, resultCallback) {
        waterfall(
            [
                function (waterfallCallback) {
                    fs.readFile(filepath, 'utf8', waterfallCallback);
                },
                function (string, waterfallCallback) {
                    waterfallCallback(null, instance.compile(string));
                }
            ],
            resultCallback);
    }
    mod.compile = compile;

    function renderFile(filepath, options, resultCallback) {
        var context = options.context || options;
        waterfall(
            [
                function (waterfallCallback) {
                    compile(filepath, waterfallCallback);
                },
                function (template, waterfallCallback) {
                    waterfallCallback(null, template(context, options));
                }
            ],
            resultCallback);
    }
    mod.renderFile = renderFile;

    return mod;
};