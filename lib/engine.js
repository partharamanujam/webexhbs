'use strict';

var fs = require('fs'),
    waterfall = require('async-waterfall');

function requireFromString(src) {
    var Module = module.constructor;
    var m = new Module();
    m._compile(src);
    return m.exports;
}

module.exports = function engine(handlebars) {
    var mod = {};
    var instance = handlebars.create();
    require('handlebars-layouts')(instance);

    function getInstance() {
        return instance;
    }
    mod.getInstance = getInstance;

    function compile(filepath, options, resultCallback) {
        if(typeof options === 'function') {
            resultCallback = options;
            options = {};
        }
        waterfall(
            [
                function (waterfallCallback) {
                    fs.readFile(filepath, 'utf8', waterfallCallback);
                },
                function (string, waterfallCallback) {
                    waterfallCallback(null, instance.compile(string, options));
                }
            ],
            resultCallback);
    }
    mod.compile = compile;

    function precompile(filepath, options, resultCallback) {
        if(typeof options === 'function') {
            resultCallback = options;
            options = {};
        }
        waterfall(
            [
                function (waterfallCallback) {
                    fs.readFile(filepath, 'utf8', waterfallCallback);
                },
                function (string, waterfallCallback) {
                    waterfallCallback(null, instance.precompile(string));
                }
            ],
            resultCallback);
    }
    mod.precompile = precompile;

    function template(spec, resultCallback) {
        setImmediate(function () {
            resultCallback(null, instance.template(requireFromString('module.exports = ' + spec)));
        });
    }
    mod.template = template;

    function renderFile(filepath, options, resultCallback) {
        waterfall(
            [
                function (waterfallCallback) {
                    compile(filepath, options, waterfallCallback);
                },
                function (template, waterfallCallback) {
                    waterfallCallback(null, template(options, options));
                }
            ],
            resultCallback);
    }
    mod.renderFile = renderFile;

    return mod;
};