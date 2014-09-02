/*!
 * helper-cache <https://github.com/jonschlinkert/helper-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var should = require('should');
var assert = require('assert');
var cache = require('..');


describe('get async helpers', function () {
  describe('.getHelperAsync():', function () {
    it('should get helpers from the cache.', function () {
      var helper = cache();

      helper.addHelperAsync('a', function (str, callback) {
        callback(null, str);
      });
      helper.addHelperAsync('b', function (str, callback) {
        callback(null, str);
      });

      var keys = Object.keys(helper._.helpersAsync);
      keys.should.have.length(2);
    });

    it('should get `load`ed helpers from the cache', function () {
      var helper = cache();

      helper.addHelpersAsync({
        a: function (str, callback) {
          callback(null, str);
        },
        b: function (str, callback) {
          callback(null, str);
        },
        c: function (str, callback) {
          callback(null, str);
        },
        d: function (str, callback) {
          callback(null, str);
        }
      });
      var a = helper.getHelperAsync('a');
      var b = helper.getHelperAsync('b');

      assert.equal(typeof a, 'function');
      assert.equal(typeof b, 'function');
    });
  });
});