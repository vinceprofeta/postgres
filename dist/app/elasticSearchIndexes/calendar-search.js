'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var queryCalendars = exports.queryCalendars = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(query) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt('return', new Promise(function (resolve, reject) {
              elasticClient.search({
                index: ['calendars_index', 'skills_index'],
                body: {
                  query: {
                    "query_string": {
                      "query": query
                    }
                  }
                }
              }, function (error, response, status) {
                if (error) {
                  console.log("search error: " + error);
                  reject("search error: " + error);
                } else {
                  console.log(response.hits.hits);
                  resolve(response.hits.hits);
                }
              });
            }));

          case 1:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function queryCalendars(_x) {
    return _ref.apply(this, arguments);
  };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var elasticClient = require('../../elasticsearch.js');
var Promise = require('bluebird');