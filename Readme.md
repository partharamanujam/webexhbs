# INCOMPLETE - THIS IS WORK IN PROGRESS

  Web Templating For Express JS Using Handlebars

```js
TODO
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
  for Express JS including support for layout-blocks and redis-based caching. Support
  is also provided for client-side templating.

## APIs

### Overview

  This module adds on top of handlebars.js to provide a standalone as well as an Express JS 
  compatible middleware to render web-page templates. It uses redis for caching templates to
  enable multi-server environments.

  See examples folder for usage of different features.

### Handlebars module

  The handlebars module is export'ed from the main-module. This is only for any additional stuff
  you may want to do (e.g., use the Utils functions). However, if you want modify how the engine
  behaves (e.g., registering partials), you will want to access the engine instance (see below).
  

```js
var webexhbs = require('webexhbs'),
    handlebars = webexhbs.handlebars;
```

### Handlebars engine

  The handlebars engine is export'ed from the main-module to be used within the Express JS
  environment. It supports async functions typical to Express JS environment.

```js
var express = require('express'),
    webexhbs = require('webexhbs'),
    engine = webexhbs.engine;
```

### Handlebars engine-instance: engine.getInstance()

  The handlebars instance used by the engine is available via getInstance() call. This is useful
  for standalone usage, or for modifying the behavior of the engine (e.g., registering custom 
  partials or helpers, or any other aspects that handlebars supports).

```js
var webexhbs = require('webexhbs'),
    engine = webexhbs.engine;

var instance = engine.getInstance();
instance.registerHelper('helper_name', function(...) { ... });
instance.registerPartial('partial_name', 'partial value');
```

### Block-helpers for Jade-like layouts

  The handlebars engine-instance supports Jade-like layouts by adding block-helpers.
  * #extend - extend a defined partial
  * #block - define a block within a partial
  * #append - append to a defined block
  * #prepend - prepend to a defined block
  * #replace - replace a defined block

  See standalone.js in examples for usage details.

### Express JS view-engine: engine.renderFile

  Use engine.renderFile as the view-engine for Express JS  environment.

```js
var express = require('express'),
    webexhbs = require('webexhbs'),
    engine = webexhbs.engine;

app = express();
app.engine('hbs', webexhbs.engine.renderFile);
```

### Compile templates: engine.compile(filepath, [options], callback)

  Compile handlebar-templates from file.

```js
var webexhbs = require('webexhbs'),
    engine = webexhbs.engine;

engine.compile(filePath, function(err, template) { ... });
```

### Precompile templates and partials: engine.precompile(filepath, [options], callback)

  Precompile handlebar templates and partials from file.

```js
var webexhbs = require('webexhbs'),
    engine = webexhbs.engine;

engine.precompile(filePath, function(err, spec) { ... });
```

### Template from spec: engine.template(spec, callback)

  Get template from precompile'd spec.

```js
var webexhbs = require('webexhbs'),
    engine = webexhbs.engine;

engine.template(spec, function(err, template) { ... });
```

## License

  [MIT](LICENSE)
