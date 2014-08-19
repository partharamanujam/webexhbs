'use strict';

var fs = require('fs'),
    path = require('path'),
    watch = require('watch'),
    asyncWaterfall = require('async-waterfall'),
    asyncForEach = require('async-foreach').forEach;

function requireFromString(src) {
    var Module = module.constructor;
    var m = new Module();
    m._compile(src);
    return m.exports;
}

function getPartialNameFromFilepath(filepath) {
    var name = path.basename(filepath, path.extname(filepath));
    return name.replace(/\s+/, '_');
}

module.exports = function engine(handlebars) {
    var mod = {};
    var instance = handlebars.create();
    instance = require('handlebars-layouts')(instance);

    function logFunction(err, item, ctxt) {
        if (err) {
            instance.logger.log(instance.logger.ERROR, item + ' : ' + ctxt + ' - ' + err.toString());
        } else {
            instance.logger.log(1, item + ' : ' + ctxt + ' - OK');
        }
    }

    function enableLogging() {
        instance.logger.level = 0;
    }
    mod.enableLogging = enableLogging;

    function registerPartial(name, filepath, resultCallback) {
        asyncWaterfall(
            [
                function (waterfallCallback) {
                    fs.readFile(filepath, 'utf8', waterfallCallback);
                },
                function (string, waterfallCallback) {
                    instance.registerPartial(name, string);
                    waterfallCallback(null);
                }
            ],
            resultCallback
        );
    }
    mod.registerPartial = registerPartial;

    function registerHelper(name, helper, resultCallback) {
        instance.registerHelper(name, helper);
        if (resultCallback) {
            setImmediate(function () {
                resultCallback(null);
            });
        }
    }
    mod.registerHelper = registerHelper;

    function compile(filepath, options, resultCallback) {
        if (typeof options === 'function') {
            resultCallback = options;
            options = {};
        }
        asyncWaterfall(
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
        if (typeof options === 'function') {
            resultCallback = options;
            options = {};
        }
        asyncWaterfall(
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

    function registerPartialsDir(dir, resultCallback) {
        watch.watchTree(dir, function (f, curr, prev) {
            if (typeof f === "object" && prev === null && curr === null) {
                // Finished walking the tree
                asyncForEach(Object.keys(f), function (item, idx, arr) {
                    var forEachCallback = this.async();
                    asyncWaterfall(
                        [
                            function (waterfallCallback) {
                                fs.stat(item, waterfallCallback);
                            },
                            function (stats, waterfallCallback) {
                                if(stats.isFile() === true) {
                                    registerPartial(getPartialNameFromFilepath(item), item, waterfallCallback);
                                } else {
                                    waterfallCallback(null);
                                }
                            }
                        ],
                        function (err) {
                            logFunction(err, item, 'register-partial');
                            forEachCallback();
                            if(idx === arr.length-1 && resultCallback) {
                                resultCallback(null);
                            }
                        }
                    );
                });
            } else if (prev === null) {
                // f is a new file
                registerPartial(getPartialNameFromFilepath(f), f,
                    function (err) {
                        logFunction(err, f, 'register-partial');
                    }
                );
            } else if (curr.nlink === 0) {
                // f was removed
                instance.registerPartial(getPartialNameFromFilepath(f), '');
                logFunction(null, f, 'remove-partial');
            } else {
                // f was changed
                registerPartial(getPartialNameFromFilepath(f), f,
                    function (err) {
                        logFunction(err, f, 'update-partial');
                    }
                );
            }
        });
    }
    mod.registerPartialsDir = registerPartialsDir;

    function renderFile(filepath, options, resultCallback) {
        asyncWaterfall(
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

//    function sendBrowserRuntime(res) {
//        res.sendfile(path.normalize(__dirname + '/handlebars.runtime-v1.3.0.min.js'));
//    }
//    mod.sendBrowserRuntime = sendBrowserRuntime;

    return mod;
};