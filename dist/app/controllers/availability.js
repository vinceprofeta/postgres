'use strict';

var Promise = require('bluebird');
var uuid = require('node-uuid');
var moment = require('moment');
var _ = require('lodash');

var bookshelf = require('../../db/bookshelf');
var Resources = bookshelf.model('resources');
var Memberships = bookshelf.model('memberships');
var Users = bookshelf.model('users');
var Calendars = bookshelf.model('calendars');
var Services = bookshelf.model('services');
// var Roles = bookshelf.model('memberships');

var availability = {};

availability.setAvailability = function (userId, data) {
  return new Promise(function (resolve, reject) {
    try {
      (function () {
        data = JSON.parse(data.availability);
        var _data = data;
        var calendars = _data.calendars;
        var times = _data.times;
        var days = _data.days;
        var interval = _data.interval;

        var timesSorted = sortTimes(times);
        var input = createCalendarInputs(days, calendars);

        bookshelf.knex.transaction(function (trx) {
          return bookshelf.knex.raw(getUsersCalendars(userId, calendars)).transacting(trx).then(function (ids) {
            console.log(ids);
            ids = _.map(ids.rows, function (row) {
              return row.id;
            });
            var deleteQuery = getDeleteQuery(userId, days, ids);
            return bookshelf.knex.raw(deleteQuery).transacting(trx);
          }).then(function (w) {
            return bookshelf.knex.insert(input, '*').into('calendarRecurringDay').transacting(trx);
          }).then(function (days) {
            var createdTimes = createTimeInputs(days, timesSorted);
            return bookshelf.knex.insert(createdTimes, '*').into('calendarRecurringTime').transacting(trx).then(trx.commit).catch(trx.rollback);
          }).then(function () {
            resolve({ success: true }); /// NEEEED TO ADD CONFLICTS?
          }).catch(function (err) {
            // console.log(err)
            reject({ error: 'Error updating availability' });
            return;
          });
        });
      })();
    } catch (err) {
      // console.log(err)
      reject({ error: 'Error updating availability' });
      return;
    }
  });
};

availability.getAll = function (properties) {
  var query = getQuery(properties);
  return bookshelf.knex.raw(query).then(function (w) {
    return properties.group ? _.groupBy(w.rows, 's_date') : w.rows;
  });
};

availability.getIsInstructorAvailable = function (properties) {
  // currently not used.
  var query = isUserAvailableGivenTimes(properties);
  return bookshelf.knex.raw(query).then(function (w) {
    return properties.group ? _.groupBy(w.rows, 's_date') : w.rows;
  });
};

availability.isUserAvailableForBooking = function (properties) {
  var query = isUserAvailableForBooking(properties);
  return bookshelf.knex.raw(query).then(function (resp) {
    console.log(resp);
    return resp.rows[0].count === '0';
  });
};

// Helper Functions
function isUserAvailableGivenTimes(_ref) {
  var agent = _ref.agent;
  var date = _ref.date;
  var start = _ref.start;
  var end = _ref.end;

  // currently not used
  start = moment(start, 'H:mm').format('HH:MM:SS');
  end = moment(end, 'H:mm').format('HH:MM:SS');
  return 'select count(1)\n  from calendars dc\n  inner join "calendarRecurringDay" dcd\n  on dcd.calendar_id = dc.id\n  inner join "calendarRecurringTime" dct\n  on dct.calendar_recurring_day_id = dcd.id\n  where dc.calendar_agent_id = ' + agent + ' and dcd.dow = EXTRACT(DOW FROM TIMESTAMP \'' + date + '\') and (\n    (dct.start > TO_TIMESTAMP(\'' + start + '\', \'HH24:MI:SS\')::TIME and dct.start < TO_TIMESTAMP(\'' + end + '\', \'HH24:MI:SS\')::TIME)\n    or \n    (dct.end > TO_TIMESTAMP(\'' + start + '\', \'HH24:MI:SS\')::TIME and dct.start < TO_TIMESTAMP(\'' + end + '\', \'HH24:MI:SS\')::TIME)\n    or \n    (dct.start <= TO_TIMESTAMP(\'' + start + '\', \'HH24:MI:SS\')::TIME and dct.end >= TO_TIMESTAMP(\'' + end + '\', \'HH24:MI:SS\')::TIME)\n  )';
}

/// Helper Functions
function isUserAvailableForBooking(_ref2) {
  var agent = _ref2.agent;
  var start = _ref2.start;
  var end = _ref2.end;

  start = moment.utc(start).format();
  end = moment.utc(end).format();
  console.log(start, end, agent);
  return 'select count(1)\n  from calendars dc\n  inner join "calendarRecurringDay" dcd\n  on dcd.calendar_id = dc.id\n  inner join "calendarRecurringTime" dct\n  on dct.calendar_recurring_day_id = dcd.id\n  inner join "bookings" book\n  on book.bookings_agent_id = ' + agent + '\n  \n  where dc.calendar_agent_id = ' + agent + ' \n  and (\n    (book.start > \'' + start + '\' and book.start < \'' + end + '\')\n    or \n    (book.end > \'' + start + '\' and book.start < \'' + end + '\')\n    or \n    (book.start <= \'' + start + '\' and book.end >= \'' + end + '\')\n  )\n\n  ';

  //  and (
  //   (dct.start > '${start}'::timestamp::TIME and dct.start < '${end}'::timestamp::TIME)
  //   or 
  //   (dct.end > '${start}'::timestamp::TIME and dct.start < '${end}'::timestamp::TIME)
  //   or 
  //   (dct.start <= '${start}'::timestamp::TIME and dct.end >= '${end}'::timestamp::TIME)
  // )
}

function getUsersCalendars(userId, calendars) {
  return 'select id from calendars ca\n  where ca.id in (' + calendars + ')\n  and calendar_agent_id = ' + userId;
}

function getDeleteQuery(userId, days, calendars) {
  return 'DELETE from "calendarRecurringDay" crd\n    WHERE crd.id IN (\n      select crd.id\n      from "calendarRecurringDay" crd\n      inner join "calendars" ca\n      on ca.id = crd.calendar_id\n      where crd.calendar_id in (' + calendars + ')\n      and ca.calendar_agent_id = ' + userId + '\n      and crd.dow = any(array[' + days + '])\n    )';
}

function getQuery(_ref3) {
  var startDate = _ref3.startDate;
  var endDate = _ref3.endDate;
  var serviceId = _ref3.serviceId;
  var agentId = _ref3.agentId;
  var distinct = _ref3.distinct;

  startDate = moment.utc(startDate).format();
  endDate = moment.utc(endDate).format();
  return 'select ' + (distinct ? 'DISTINCT ON (s_date)' : '') + ' s.date, au.first_name, au.last_name, ds.service_duration, ds.service_name, calendar_service_id, au.facebook_user_id,\n  dc.id as calendar_id, calendar_capacity, dcd.dow, dct.start, dct.end, s.date::timestamp::date as s_date, to_char(s.date, \'YYYY-MM-DD\') as raw_date,\n  (\n     select jsonb_agg(bookings)\n     from (\n        select db.start, db.end\n        from bookings db\n        where db.booking_calendar_id = dc.id\n        and "time"(db.start) between dct.start and dct.end\n        and "time"(db."end") between dct.start and dct.end\n        and s.date = date(db.start)\n     ) bookings\n  ) as bookings,\n  (\n     select jsonb_agg(override)\n     from (\n        select cso.start, cso.end\n        from "calendarScheduleOverride" cso\n        where cso.calendar_id = dc.id\n        and "time"(cso.start) between dct.start and dct.end\n        and "time"(cso."end") between dct.start and dct.end\n        and s.date = date(cso.start)\n        and cso.available=\'f\'\n     ) override\n  ) as unavailable_overrides\n  from calendars dc\n  inner join "calendarRecurringDay" dcd\n  on dcd.calendar_id = dc.id\n  inner join users au\n  on au.id = dc.calendar_agent_id\n  inner join services ds\n  on ds.id = calendar_service_id\n  inner join "calendarRecurringTime" dct\n  on dct.calendar_recurring_day_id = dcd.id\n  inner join generate_series(\'' + startDate + '\'::timestamp,\n                                \'' + endDate + '\', \'1 day\') as s(a)\n  on 1=1\n  where ' + (serviceId ? 'dc.calendar_service_id =' + serviceId : '') + ' ' + (serviceId && agentId ? 'and dc.calendar_agent_id =' + agentId : '') + ' ' + (!serviceId && agentId ? 'dc.calendar_agent_id =' + agentId : '') + '\n  and dcd.dow = EXTRACT(DOW FROM s.date)\n  group by dcd.id, au.id, ds.id, dct.id, dc.id, s.date, s.a\n\n  union\n\n  select s.date, au.first_name, au.last_name, ds.service_duration, ds.service_name, calendar_service_id, au.facebook_user_id,\n  dc.id as calendar_id, calendar_capacity, EXTRACT(DOW FROM s.date) as dow, dcd.start::timestamp::time, dcd.end::timestamp::time, s.date::timestamp::date as s_date, to_char(s.date, \'YYYY-MM-DD\') as raw_date,\n  (\n     select jsonb_agg(bookings)\n     from (\n        select db.start, db.end\n        from bookings db\n        where db.booking_calendar_id = dc.id\n        and "time"(db.start) between "time"(dcd.start) and "time"(dcd.end)\n        and "time"(db."end") between "time"(dcd.start) and "time"(dcd.end)\n        and db.start::timestamp::date = s.date::timestamp::date\n     ) bookings\n  ) as bookings,\n  (\n     select jsonb_agg(override)\n     from (\n        select cso.start, cso.end\n        from "calendarScheduleOverride" cso\n        where cso.calendar_id = dc.id\n        and "time"(cso.start) between "time"(dcd.start) and "time"(dcd.end)\n        and "time"(cso."end") between "time"(dcd.start) and "time"(dcd.end)\n        and s.date = date(cso.start)\n        and cso.available=\'f\'\n     ) override\n  ) as unavailable_overrides\n  from calendars dc\n  inner join users au\n  on au.id = dc.calendar_agent_id\n  inner join services ds\n  on ds.id = calendar_service_id\n  inner join generate_series(\'' + startDate + '\'::timestamp,\n                                \'' + endDate + '\', \'1 day\') as s(a)\n  on 1=1\n  inner join "calendarScheduleOverride" dcd\n  on dcd.calendar_id = dc.id and date(dcd.start) = s.date\n  where ' + (serviceId ? 'calendar_service_id =' + serviceId : '') + '\n  and dcd.available=\'t\'\n  group by dcd.id, au.id, ds.id, dcd.id, dc.id, s.date, s.a';
}

function sortTimes(array) {
  array = array.sort(function (a, b) {
    a = moment(a, 'H:mm');
    b = moment(b, 'H:mm');
    return a.isBefore(b) ? -1 : a.isAfter(b) ? 1 : 0;
  });
  return groupTimes(array);
}

function groupTimes(times) {
  var interval = 30;
  return _.chain(times).reduce(function (result, time, i, array) {
    if (array[i - 1]) {
      if (moment(time, 'H:mm').diff(moment(array[i - 1], 'H:mm'), 'minutes') > 30) {
        result.push([time]);
      } else {
        result[result.length - 1].push(time);
      }
    } else {
      result.push([time]);
    }
    return result;
  }, []).map(function (group) {
    return {
      start: group[0],
      end: group[group.length - 1]
    };
  }).value();
}

function createCalendarInputs(days, calendars) {
  return _.reduce(calendars, function (result, calendar, i, array) {
    var array = _.map(days, function (day) {
      return {
        calendar_id: calendar,
        dow: day
      };
    });
    result = result.concat(array);
    return result;
  }, []);
}

function createTimeInputs(days, times) {
  return _.reduce(days, function (result, day, i, array) {
    times = _.cloneDeep(times);
    var array = _.map(times, function (time) {
      return _.merge(time, { calendar_recurring_day_id: day.id });
    });
    result = result.concat(array);
    return result;
  }, []);
}

module.exports = availability;