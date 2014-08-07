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
  * Express JS compatible view rendering engine - TODO
  * Background template compilation - TODO
  * Redis based caching for multi-instance servers - TODO
  * Client-side template-based redering support - TODO

## Philosophy

  One of the many possible implementations of template-based rendering using Handlebars
  for Express JS including support for layout-blocks and redis-based caching needed
  for any serious development effort.
  
  This is an attempt to provide a one-stop solution to get started...

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

### Handlebars Express JS engine

  The handlebars engine is export'ed from the main-module to be used as the templating engine in
  Express JS. 

```js
var webexhbs = require('webexhbs'),
    engine = webexhbs.engine;
TODO
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

  The handlebars engine-instance supports Jade-like layouts by adding the block-helpers.
  * #extend - extend a defined partial
  * #block - define a block within a partial
  * #append - append to a defined block
  * #prepend - prepend to a defined block
  * #replace - replace a defined block

  See standalone.js in examples for usage details.

## License

  [MIT](LICENSE)
