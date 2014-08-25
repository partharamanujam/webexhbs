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
    var cache = {
        'partials': {}, // client
        'views': {} // server
    };
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
            resultCallback
        );
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
            resultCallback
        );
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

    function registerViewsDir(dir, resultCallback) {
        watch.watchTree(dir, function (f, curr, prev) {
            if (typeof f === "object" && prev === null && curr === null) {
                // Finished walking the tree
                cache.views = {};
                logFunction(null, 'view-cache', 'init');
                resultCallback(null);
            } else {
                // f : new-file, removed, changed
                if (cache.views[f]) {
                    logFunction(null, f, 'clear-view-cache');
                    delete cache.views[f];
                }
            }
        });
    }
    mod.registerViewsDir = registerViewsDir;

    function updateViewCache(filepath, options, resultCallback) {
        asyncWaterfall(
            [
                function (waterfallCallback) {
                    precompile(filepath, options, waterfallCallback);
                },
                function (spec, waterfallCallback) {
                    cache.views[filepath] = spec;
                    waterfallCallback(null);
                }
            ],
            resultCallback
        );
    }

    function renderFromCache(filepath, options, resultCallback) {
        if(cache.views[filepath]) {
            asyncWaterfall(
                [
                    function (waterfallCallback) {
                        template(cache.views[filepath], waterfallCallback);
                    },
                    function (templFunc, waterfallCallback) {
                        waterfallCallback(null, templFunc(options));
                    }
                ],
                resultCallback
            );
        } else {
            resultCallback(new Error('view-template not found in cache'));
        }
    }

    function renderFile(filepath, options, resultCallback) {
        if (options.cache) {
            asyncWaterfall(
                [
                    function (waterfallCallback) {
                        if (cache.views[filepath]) {
                            waterfallCallback(null);
                        } else {
                            updateViewCache(filepath, options, waterfallCallback);
                        }
                    },
                    function (waterfallCallback) {
                        renderFromCache(filepath, options, waterfallCallback);
                    }
                ],
                resultCallback
            );
        } else {
            if (cache.views[filepath]) {
                delete cache.views[filepath];
            }
            asyncWaterfall(
                [
                    function (waterfallCallback) {
                        compile(filepath, options, waterfallCallback);
                    },
                    function (templFunc, waterfallCallback) {
                        waterfallCallback(null, templFunc(options));
                    }
                ],
                resultCallback
            );
        }
    }
    mod.renderFile = renderFile;

    function sendBrowserRuntime(res) {
        res.sendfile(path.normalize(__dirname + '/handlebars.runtime-v1.3.0.min.js'));
    }
    mod.sendBrowserRuntime = sendBrowserRuntime;

    function cacheClientPartial(name, filepath, resultCallback) {
        asyncWaterfall(
            [
                function (waterfallCallback) {
                    precompile(filepath, waterfallCallback);
                },
                function (spec, waterfallCallback) {
                    cache.partials[name] = spec;
                    waterfallCallback(null);
                }
            ],
            resultCallback
        );
    }

    function registerClientPartialsDir(dir, resultCallback) {
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
                                    cacheClientPartial(getPartialNameFromFilepath(item), item, waterfallCallback);
                                } else {
                                    waterfallCallback(null);
                                }
                            }
                        ],
                        function (err) {
                            logFunction(err, item, 'register-client-partial');
                            forEachCallback();
                            if(idx === arr.length-1 && resultCallback) {
                                resultCallback(null);
                            }
                        }
                    );
                });
            } else if (prev === null) {
                // f is a new file
                cacheClientPartial(getPartialNameFromFilepath(f), f,
                    function (err) {
                        logFunction(err, f, 'register-client-partial');
                    }
                );
            } else if (curr.nlink === 0) {
                // f was removed
                delete cache.partials[getPartialNameFromFilepath(f)];
                logFunction(null, f, 'remove-client-partial');
            } else {
                // f was changed
                cacheClientPartial(getPartialNameFromFilepath(f), f,
                    function (err) {
                        logFunction(err, f, 'update-client-partial');
                    }
                );
            }
        });
    }
    mod.registerClientPartialsDir = registerClientPartialsDir;

    function sendClientPartial(res, name) {
        if(cache.partials[name]) {
            res.send('(function(){var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};Handlebars.partials[\'' + name + '\'] = template(' + cache.partials[name] + ');})();');
        } else {
            res.send(404, 'client-partial not found: ' + name);
        }
    }
    mod.sendClientPartial = sendClientPartial;

    return mod;
};
