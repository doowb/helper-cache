/*!
 * helper-cache <https://github.com/jonschlinkert/helper-cache>
 *
 * Copyright (c) 2014-2015 Jon Schlinkert
 * Licensed under the MIT License
 */

'use strict';

var should = require('should');
var assert = require('assert');
var cache = require('..');

describe('add helper', function () {
  it('should create instance of helper cache', function () {
    var actual = cache('foo');

    actual.should.be.an.object;
    actual.should.be.instanceof.cache;
    assert.equal(actual instanceof cache, true);
  });

  it('should add an object of helpers to the cache', function () {
    var helpers = cache();
    helpers.addHelpers({
      a: function() {},
      b: function() {},
      c: function() {},
    });

    helpers.a.should.be.a.function;
    helpers.b.should.be.a.function;
    helpers.c.should.be.a.function;
  });

  it.skip('should add an object of helpers from a string of glob patterns.', function () {
    var helpers = cache();
    helpers.addHelpers('test/fixtures/obj/*.js');

    helpers.a.should.be.a.function;
    helpers.b.should.be.a.function;
    helpers.c.should.be.a.function;
  });

  it.skip('should add an object of helpers from an array of file paths.', function () {
    var helpers = cache();
    helpers.addHelpers([
      'test/fixtures/obj/a.js',
      'test/fixtures/obj/{b,c}.js'
    ]);

    helpers.a.should.be.a.function;
    helpers.b.should.be.a.function;
    helpers.c.should.be.a.function;
  });

  it.skip('should add an object of helpers from an array of glob patterns.', function () {
    var helpers = cache();
    helpers.addHelpers(['test/fixtures/obj/*.js']);

    helpers.a.should.be.a.function;
    helpers.b.should.be.a.function;
    helpers.c.should.be.a.function;
  });


  describe('.addHelpers():', function () {
    it('should add an object of helper functions to the cache.', function () {
      var helpers = cache();

      helpers.addHelpers({
        a: function (str) {
          return str;
        },
        b: function (str) {
          return str;
        },
        c: function (str) {
          return str;
        },
        d: function (str) {
          return str;
        }
      });

      var keys = Object.keys(helpers);
      keys.should.have.length(4);
    });

    it('should load helpers from a function', function () {
      var helpers = cache();

      var fn = function () {
        return {
          foo: function () {
            return 'foo';
          },
          bar: function () {
            return 'bar';
          }
        };
      };
      var actual = helpers.addHelpers(fn);
      helpers.should.have.property('foo');
      helpers.should.have.property('bar');
    });

    it.skip('should load different types of helpers from an array', function () {
      var helpers = cache();

      var arr = [
        'test/fixtures/two.js',
        {
          foo: function () {
            return 'hi';
          }
        },
        function () {
          return {
            foo: function () {
              return 'hi';
            }
          };
        },
        [
          'test/fixtures/three.js',
          {
            bar: function () {
              return 'hi';
            }
          },
          function () {
            return {
              bar: function () {
                return 'hi';
              }
            };
          }
        ]
      ];

      var actual = helpers.addHelpers(arr);
      helpers.should.have.property('two');
      helpers.should.have.property('foo');
      helpers.should.have.property('three');
      helpers.should.have.property('bar');
    });
  });

  describe('.addHelpers()', function () {
    it.skip('should load helpers from a string', function () {
      var helpers = cache();

      var str = __dirname + '/fixtures/wrapped/wrapped.js';
      var actual = helpers.addHelpers(str);
      helpers.should.have.property('wrapped');
    });

    it('should load helpers from a function', function () {
      var helpers = cache();

      var fn = function () {
        return {
          foo: function () {
            return 'foo';
          },
          bar: function () {
            return 'bar';
          }
        };
      };
      var actual = helpers.addHelpers(fn);
      helpers.should.have.property('foo');
      helpers.should.have.property('bar');
    });

    it('should load helpers from an object', function () {
      var helpers = cache();

      var obj = require('./fixtures/wrapped/wrapped.js');
      var actual = helpers.addHelpers(obj);

      helpers.should.have.property('wrapped');
    });

    it('should load helpers from an object', function () {
      var helpers = cache();

      var obj = {
        foo: function () {
          return 'hi';
        }
      };
      var actual = helpers.addHelpers(obj);
      helpers.should.have.property('foo');
    });

    it('should load helpers from a function', function () {
      var helpers = cache();

      var fn = require('./fixtures/two.js');
      var actual = helpers.addHelpers({ 'two': fn });

      helpers.should.have.property('two');
    });

    it.skip('should load different types of helpers from an array', function () {
      var helpers = cache();
      var arr = [
        'test/fixtures/two.js',
        {
          foo: function () {
            return 'hi';
          }
        },
        function () {
          return {
            foo: function () {
              return 'hi';
            }
          };
        },
        [
          'test/fixtures/three.js',
          {
            bar: function () {
              return 'hi';
            }
          },
          function () {
            return {
              bar: function () {
                return 'hi';
              }
            };
          }
        ]
      ];

      var actual = helpers.addHelpers(arr);
      helpers.should.have.property('two');
      helpers.should.have.property('foo');
      helpers.should.have.property('three');
      helpers.should.have.property('bar');
    });
  });
});

describe('load functions:', function () {
  describe('.function():', function () {
    it('should load helpers from a function', function () {
      var helpers = cache();

      var fn = function () {
        return {
          foo: function () {
            return 'foo';
          },
          bar: function () {
            return 'bar';
          }
        };
      };

      var actual = helpers.addHelpers(fn);

      actual.should.have.property('foo');
      actual.should.have.property('bar');

      var foo = helpers.getHelper('foo');
      assert.equal(typeof foo, 'function');
    });
  });
});

