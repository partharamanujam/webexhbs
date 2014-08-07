'use strict';

module.exports = function engine(handlebars) {
    var mod = {};
    var instance = handlebars.create();
    require('handlebars-layouts')(instance);

    function getInstance() {
        return instance;
    }

    mod.getInstance = getInstance;

    return mod;
};
