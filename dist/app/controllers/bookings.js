'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var Promise = require('bluebird');
var uuid = require('node-uuid');
var moment = require('moment');
var _ = require('lodash');

var bookshelf = require('../../db/bookshelf');
var Bookings = bookshelf.model('services');
var Bookings = bookshelf.model('bookings');
var availability = require('./availability');

var bookings = {};

bookings.getAll = function (limit, offset) {
  return Bookings.fetchAll({});
};

bookings.getBookings = function (query) {
  query = query || {};
  var queryObject = {
    // bookings_resource_id: query.resource,
    // bookings_agent_id: query.agent,
    booking_calendar_id: query.service,

    booking_capacity: query.capacity,
    bookingPrice: query.price,
    booking_status: query.status,

    // TODO BEFORE AND AFTER QUERIES
    start: moment.utc(query.start).format(),
    end: moment.utc(query.end).format()
  };

  return bookshelf.knex.raw('\n    select sv.*, bk.*, cd.*, us.first_name, us.last_name\n    from bookings bk\n    inner join calendars cd\n    on cd.id = bk.id\n    inner join services sv\n    on sv.id = cd.calendar_service_id\n    inner join users us\n    on cd.calendar_agent_id = us.id\n    where cd.id = bk.booking_calendar_id\n  ').then(function (result) {
    return result.rows;
  });

  return Bookings.where(_.pickBy(queryObject, _.identity)).fetchAll({
    // withRelated: ['resource', 'skill'],
  });
  // .limit(query.limit || 10)
  // .skip(query.offset || 0)
  // .populate('instructor skill')
};

bookings.getById = function (id) {
  return Bookings.where('id', id).fetch({
    // withRelated: ['resource', 'skill'],
  });
};

bookings.add = function (data) {
  // TODO add required on calendar
  return new Promise(function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(resolve, reject) {
      var _this = this;

      var user, params, _ret;

      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              user = data.user;
              params = data.calendar;
              _context3.prev = 2;
              return _context3.delegateYield(regeneratorRuntime.mark(function _callee2() {
                var calendar, noConflicts, booking;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        _context2.next = 2;
                        return bookshelf.knex('calendars').where({ 'calendars.id': params.calendar_id }).join('services', 'services.id', '=', 'calendars.calendar_service_id').select('calendars.*', 'services.service_capacity');

                      case 2:
                        calendar = _context2.sent;

                        calendar = calendar[0];

                        _context2.next = 6;
                        return availability.isUserAvailableForBooking({ start: params.start, end: params.end, agent: calendar.calendar_agent_id });

                      case 6:
                        noConflicts = _context2.sent;

                        if (noConflicts) {
                          _context2.next = 10;
                          break;
                        }

                        reject({ error: 'A booking already exists in the time slot' });
                        return _context2.abrupt('return', {
                          v: void 0
                        });

                      case 10:
                        booking = {
                          booking_calendar_id: calendar.id,
                          bookings_agent_id: calendar.calendar_agent_id,
                          booking_capacity: calendar.calendar_capacity || calendar.service_capacity,
                          booking_status: '',
                          start: moment.utc(params.start).format(),
                          end: moment.utc(params.end).format()
                        };


                        bookshelf.knex.transaction(function () {
                          var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(trx) {
                            var bookingDb, enrolled;
                            return regeneratorRuntime.wrap(function _callee$(_context) {
                              while (1) {
                                switch (_context.prev = _context.next) {
                                  case 0:
                                    _context.prev = 0;
                                    _context.next = 3;
                                    return bookshelf.knex('bookings').insert(booking).transacting(trx).returning('*');

                                  case 3:
                                    bookingDb = _context.sent;
                                    _context.next = 6;
                                    return bookshelf.knex('enrolledUsers').insert({
                                      booking_id: bookingDb[0].id,
                                      booking_user_id: user
                                    }).returning('*').transacting(trx);

                                  case 6:
                                    enrolled = _context.sent;

                                    trx.commit;
                                    resolve(enrolled);
                                    _context.next = 15;
                                    break;

                                  case 11:
                                    _context.prev = 11;
                                    _context.t0 = _context['catch'](0);

                                    trx.rollback;
                                    throw _context.t0;

                                  case 15:
                                  case 'end':
                                    return _context.stop();
                                }
                              }
                            }, _callee, this, [[0, 11]]);
                          }));

                          return function (_x3) {
                            return _ref2.apply(this, arguments);
                          };
                        }());

                      case 12:
                      case 'end':
                        return _context2.stop();
                    }
                  }
                }, _callee2, _this);
              })(), 't0', 4);

            case 4:
              _ret = _context3.t0;

              if (!((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object")) {
                _context3.next = 7;
                break;
              }

              return _context3.abrupt('return', _ret.v);

            case 7:
              _context3.next = 13;
              break;

            case 9:
              _context3.prev = 9;
              _context3.t1 = _context3['catch'](2);

              console.log(_context3.t1);
              reject(_context3.t1);

            case 13:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this, [[2, 9]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
};

bookings.updateById = function (id, params) {
  var updatedObj = {};

  if (params.start) {
    updatedObj.start = moment.utc(params.start).format();
    // SEND PUSH AND UPDATE USERS
  }

  if (params.end) {
    updatedObj.end = moment.utc(params.end).format();
    // SEND PUSH AND UPDATE USERS
  }

  if (params.status) {
    updatedObj.status = params.status;
  }

  if (params.notes) {
    updatedObj.notes = params.notes;
  }

  if (params.custom_data) {
    updatedObj.custom_data = params.custom_data;
  }

  return bookshelf.knex('bookings').where('id', '=', id).update(updatedObj);
};

module.exports = bookings;