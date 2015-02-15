/*!
 * helper-cache <https://github.com/jonschlinkert/helper-cache>
 *
 * Copyright (c) 2014-2015 Jon Schlinkert, Brian Woodward
 * Licensed under the MIT license.
 */

'use strict';

var loader = require('load-helpers');
var randomize = require('randomatic');
var _ = require('lodash');


/**
 * Create an instance of `Helpers`, optionally passing
 * default `options`.
 *
 * ```js
 * var Helpers = require('helper-cache');
 * var helpers = new Helpers();
 * ```
 *
 * @param {Object} `options` Default options to use.
 *   @option {Boolean} [options] `bind` Bind functions to `this`. Defaults to `false`.
 *   @option {Boolean} [options] `thisArg` The context to use.
 * @api public
 */

function Helpers(options) {
  if (!(this instanceof Helpers)) {
    return new Helpers(options);
  }

  var opts = _.defaults({}, options, {
    bind: false,
    thisArg: this
  });

  defineGetter(this, 'options', function () {
    return opts;
  });

  var obj = {asyncHelpers: {}, waiting: []};
  defineGetter(this, '_', function () {
    return obj;
  });
}


/**
 * Register a helper.
 *
 * ```js
 * helpers.addHelper('lower', function(str) {
 *   return str.toLowerCase();
 * });
 * ```
 *
 * @name .addHelper
 * @param {String} `name` The name of the helper.
 * @param {Function} `fn` Helper function.
 * @api public
 */

defineGetter(Helpers.prototype, 'addHelper', function () {
  return function (name, fn, thisArg) {
    thisArg = thisArg || this.options.thisArg;

    if (typeof name !== 'string') {
      _.extend(this, name);
    } else {
      if (this.options.bind) {
        this[name] = _.bind(fn, thisArg);
      } else {
        this[name] = fn;
      }
    }
    return this;
  }.bind(this);
});


/**
 * Register an async helper.
 *
 * ```js
 * helpers.addAsyncHelper('foo', function (str, callback) {
 *   callback(null, str + ' foo');
 * });
 * ```
 *
 * @name .addAsyncHelper
 * @param {String} `key` The name of the helper.
 * @param {Function} `fn` Helper function.
 * @api public
 */

defineGetter(Helpers.prototype, 'addAsyncHelper', function () {
  return function(key, fn, thisArg) {
    thisArg = thisArg || this.options.thisArg;
    if (typeof key !== 'string') {
      _.forOwn(key, function (value, k) {
        this.addAsyncHelper(k, value, thisArg);
      }, this);
    } else {
      var self = this;
      if (this.options.bind) {
        this._.asyncHelpers[key] = _.bind(fn, thisArg || this);
      } else {
        this._.asyncHelpers[key] = fn;
      }
      this.addHelper(key, function () {
        var id = '__async_helper_id__' + randomize('Aa0', 42) + '__';
        var args = [].slice.call(arguments);
        self._.waiting.push({id: id, key: key, args: args, fn: fn.bind(this)});
        return id;
      });
    }
    return this;
  }
});


/**
 * Load a glob or object of helpers.
 *
 * ```js
 * // glob patterns
 * helpers.addHelpers('helpers/*.js');
 * helpers.addHelpers(['helpers/a.js', 'helpers/{b,c}.js']);
 * // object of helper functions
 * helpers.addHelpers({
 *   a: function() {},
 *   b: function() {},
 *   c: function() {},
 * });
 * ```
 *
 * See [load-helpers] for issues, API details and the full range of options.
 *
 * @name .addHelpers
 * @param {String} `key` The name of the helper.
 * @param {Function} `fn` Helper function.
 * @api public
 */

defineGetter(Helpers.prototype, 'addHelpers', function () {
  return function () {
    var thisArg = this.options.thisArg;

    loader.init();

    var helpers = loader.load.apply(loader, arguments);
    _.forIn(helpers.cache, function (value, key) {
      var o = {};
      if (this.options.bind) {
        o[key] = _.bind(value, thisArg);
      } else {
        o[key] = value;
      }
      _.extend(this, o);
    }, this);

    return this;
  }.bind(this);
});


/**
 * Load a glob or object of async helpers.
 *
 * ```js
 * // glob patterns
 * helpers.addAsyncHelpers('helpers/*.js');
 * helpers.addAsyncHelpers(['helpers/a.js', 'helpers/{b,c}.js']);
 * // object of helper functions
 * helpers.addAsyncHelpers({
 *   a: function() {},
 *   b: function() {},
 *   c: function() {},
 * });
 * ```
 *
 * See [load-helpers] for issues, API details and the full range of options.
 *
 * @name .addAsyncHelpers
 * @param {String} `key` The name of the helper.
 * @param {Function} `fn` Helper function.
 * @api public
 */

defineGetter(Helpers.prototype, 'addAsyncHelpers', function () {
  return function () {
    var thisArg = this.options.thisArg;
    loader.init();
    var helpers = loader.load.apply(loader, arguments);
    return this.addAsyncHelper(helpers.cache);
  }.bind(this);
});


/**
 * Get a registered helper.
 *
 * ```js
 * helpers.getHelper('foo');
 * ```
 *
 * @name .getHelper
 * @param  {String} `key` The helper to get.
 * @return {Object} The specified helper. If no `key` is passed, the entire cache is returned.
 * @api public
 */

defineGetter(Helpers.prototype, 'getHelper', function () {
  return function(key) {
    if (!key) {
      return this;
    }
    return this[key];
  }.bind(this);
});

/**
 * Get a registered async helper.
 *
 * ```js
 * helpers.getAsyncHelper('foo');
 * ```
 *
 * @name .getAsyncHelper
 * @param  {String} `key` The helper to get.
 * @return {Object} The specified helper. If no `key` is passed, the entire cache is returned.
 * @api public
 */

defineGetter(Helpers.prototype, 'getAsyncHelper', function () {
  return function(key) {
    if (!key) {
      return this._.asyncHelpers;
    }
    return this._.asyncHelpers[key];
  }.bind(this);
});

/**
 * Getter method to resolve async helper values that were called during
 * the render process. Rendering is done by whatever engine you've registered
 * the helpers with.
 *
 * ```js
 * helper.resolveHelper(str, function (err, content) {
 *   if (err) return done(err);
 *   // do stuff with `content`
 *   done();
 * });
 * ```
 * @name .resolveHelper
 * @param {String} `content` Rendered string containing async ids
 * @param {Function} `cb`
 * @api public
 */

defineGetter(Helpers.prototype, 'resolveHelper', function () {
  return function (content, cb) {
    var self = this;
    var i = self._.waiting.length;
    var next = function (err, content) {
      // current helper info
      var helper = self._.waiting[--i];

      if (helper) {
        // original async helper
        var fn = helper.fn;

        if (!fn) return next(null, content);
        if (content.indexOf(helper.id) === -1) {
          return next(null, content);
        }

        // replacing this helper id, so remove it from the waiting list
        // call the async helper and replace id with results
        var args = helper.args || [];
        var nextCallback = function (err, results) {
          if (err) return cb(err);
          content = content.replace(helper.id, results);
          // remove the helper from the waiting list
          self._.waiting.splice(i+1, 1);
          next(null, content);
        };
        if (args[args.length-1].toString() !== nextCallback.toString()) {
          args.push(nextCallback);
        }

        fn.apply(fn, args);
      } else {
        // call final callback
        return cb(null, content);
      }
    }
    return next(null, content);
  };
});

/**
 * Utility method to define getters.
 *
 * @param  {Object} `obj`
 * @param  {String} `name`
 * @param  {Function} `getter`
 * @return {Getter}
 * @api private
 */

function defineGetter(obj, name, getter) {
  Object.defineProperty(obj, name, {
    configurable: false,
    enumerable: false,
    get: getter,
    set: function() {}
  });
}


module.exports = Helpers;
