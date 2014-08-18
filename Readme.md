# INCOMPLETE - THIS IS WORK IN PROGRESS

  Web Templating For Express JS Using Handlebars

```js
var webexhbs = require('../lib'),
    handlebars = webexhbs.handlebars,
    engine = webexhbs.engine;

// handlebars for standalone usage
handlebars.registerHelper(name, function () {});
handlebars.registerPartial(name, 'partial');
// and the rest as usual...

// 'async' engine
engine.registerHelper(name, filepath, callback);
engine.registerPartial(name, filepath, callback);
engine.compile(filepath, callback);
engine.precompile(filepath, callback);
engine.template(spec, callback);

// Express JS view-engine
expressapp.engine('hbs', webexhbs.engine.renderFile);
```

## Installation

```bash
$ npm install webexhbs
```

### Installation Dependencies

  * Node JS (v0.10.29+) - http://www.nodejs.org
  * Redis (v2.6.12+) - http://redis.io

## Features

  * Templating using [handlebars.js](https://github.com/wycats/handlebars.js)
  * Jade-like layout-blocks using [handlebars-layouts](https://github.com/shannonmoeller/handlebars-layouts)
  * Express JS compatible view rendering engine
  * Precompile support for better performance
  * Redis based caching for multi-instance servers - TODO
  * Background template compilation - TODO
  * Client-side template-based redering support - TODO

## Philosophy

  One of the many possible implementations of template-based rendering using Handlebars
  for Express JS, including support for layout-blocks and redis-based caching. Support
  is also provided for browser/client-side templating.

## APIs

### Overview

  This module adds on top of handlebars.js to provide a standalone as well as an Express JS 
  compatible middleware to render web-page templates. It uses redis for caching templates to
  enable multi-server environments.

  See examples folder for usage of different features.

### Handlebars module

  The handlebars module is export'ed from the main-module. This is only for any additional stuff
  you may want to do (e.g., use the Utils functions). However, if you want modify how the engine
  behaves (e.g., registering partials), you will want to access the engine APIs (see below).
  

```js
var webexhbs = require('webexhbs'),
    handlebars = webexhbs.handlebars;
```

### Block-helpers for Jade-like layouts

  The handlebars module supports Jade-like layouts by adding block-helpers.
  * #extend - extend a defined partial
  * #block - define a block within a partial
  * #append - append to a defined block
  * #prepend - prepend to a defined block
  * #replace - replace a defined block
  *

  See standalone.js in examples for usage details.

### Handlebars engine

  The handlebars engine is export'ed from the main-module to be used within the Express JS
  environment. It supports async functions typical to Express JS environment.

```js
var express = require('express'),
    webexhbs = require('webexhbs'),
    engine = webexhbs.engine;
```

### Register Helpers: engine.registerHelper(name, filepath, callback)

  Handlebar helpers can be registered with the engine using this API.

### Register Partials: engine.registerPartial(name, filepath, callback)

  Handlebar partials can be registered with the engine using this API.

### Compile templates: engine.compile(filepath, [options], callback)

  Compile handlebar-templates from file.
  See compile.js in examples folder for usage details.

### Precompile templates/partials to spec: engine.precompile(filepath, [options], callback)

  Precompile handlebar templates and partials from file.

### Template from spec: engine.template(spec, callback)

  Get template from precompile'd spec.
  See precompile.js in examples folder for usage details.

### Express JS view-engine: engine.renderFile

  Use engine.renderFile as the view-engine for Express JS  environment.

```js
var express = require('express'),
    webexhbs = require('webexhbs'),
    engine = webexhbs.engine;

app = express();
app.engine('hbs', webexhbs.engine.renderFile);
```

## License

  [MIT](LICENSE)
