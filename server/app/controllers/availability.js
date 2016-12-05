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

availability.setAvailability = function(userId, data) {
  return new Promise(function(resolve, reject) {
    try {
      data = JSON.parse(data.availability);
      const {calendars, times, days, interval} = data;
      const timesSorted = sortTimes(times);
      const input = createCalendarInputs(days, calendars);

      bookshelf.knex.transaction(function(trx) {
        return bookshelf.knex.raw(getUsersCalendars(userId, calendars)).transacting(trx)
        .then((ids) => {
          console.log(ids)
          ids = _.map(ids.rows, (row) => {
            return row.id
          })
          const deleteQuery = getDeleteQuery(userId, days, ids);
          return bookshelf.knex.raw(deleteQuery).transacting(trx)
        })
        .then((w) => {
          return bookshelf.knex.insert(input, '*').into('calendarRecurringDay').transacting(trx)
        })
        .then((days) => {
          const createdTimes = createTimeInputs(days, timesSorted)
          return bookshelf.knex.insert(createdTimes, '*').into('calendarRecurringTime').transacting(trx)
          .then(trx.commit)
          .catch(trx.rollback);
        })
        .then(() => {
          resolve({success: true}) /// NEEEED TO ADD CONFLICTS?
        })
        .catch((err) => {
          // console.log(err)
          reject({error: 'Error updating availability'});
          return;
        })
      });

    } catch(err) {
      // console.log(err)
      reject({error: 'Error updating availability'});
      return;
    }
  });
};


availability.getAll = function(properties) {
  var query = getQuery(properties);
  return bookshelf.knex.raw(query).then(function(w) {
    return properties.group ? _.groupBy(w.rows, 's_date') : w.rows
  })
};


availability.getIsInstructorAvailable = function(properties) {
  // currently not used.
  var query = isUserAvailableGivenTimes(properties);
  return bookshelf.knex.raw(query).then(function(w) {
    return properties.group ? _.groupBy(w.rows, 's_date') : w.rows
  })
};

availability.isUserAvailableForBooking = function(properties) {
  var query = isUserAvailableForBooking(properties);
  console.log(query)
  return bookshelf.knex.raw(query)
  .then(function(resp) {
    console.log(resp)
    return resp.rows[0].count === '0';
  })
};





// Helper Functions
function isUserAvailableGivenTimes({agent, date, start, end}) {
  // currently not used
  start = moment(start, 'H:mm').format('HH:MM:SS')
  end = moment(end, 'H:mm').format('HH:MM:SS')
  return`select count(1)
  from calendars dc
  inner join "calendarRecurringDay" dcd
  on dcd.calendar_id = dc.id
  inner join "calendarRecurringTime" dct
  on dct.calendar_recurring_day_id = dcd.id
  where dc.calendar_agent_id = ${agent} and dcd.dow = EXTRACT(DOW FROM TIMESTAMP '${date}') and (
    (dct.start > TO_TIMESTAMP('${start}', 'HH24:MI:SS')::TIME and dct.start < TO_TIMESTAMP('${end}', 'HH24:MI:SS')::TIME)
    or 
    (dct.end > TO_TIMESTAMP('${start}', 'HH24:MI:SS')::TIME and dct.start < TO_TIMESTAMP('${end}', 'HH24:MI:SS')::TIME)
    or 
    (dct.start <= TO_TIMESTAMP('${start}', 'HH24:MI:SS')::TIME and dct.end >= TO_TIMESTAMP('${end}', 'HH24:MI:SS')::TIME)
  )`
}


/// Helper Functions
function isUserAvailableForBooking({agent, start, end}) {
  // start = moment.utc(start).format();
  // end = moment.utc(end).format();
  console.log(start, end, agent)
  return`select count(1)
  from calendars dc
  inner join "calendarRecurringDay" dcd
  on dcd.calendar_id = dc.id
  inner join "calendarRecurringTime" dct
  on dct.calendar_recurring_day_id = dcd.id
  inner join "bookings" book
  on book.bookings_agent_id = ${agent}
  
  where dc.calendar_agent_id = ${agent} 
  and (
    (book.start > '${start}'::timestamp and book.start < '${end}'::timestamp)
    or 
    (book.end > '${start}'::timestamp and book.start < '${end}'::timestamp)
    or 
    (book.start <= '${start}'::timestamp and book.end >= '${end}'::timestamp)
  )

  `

  //  and (
  //   (dct.start > '${start}'::timestamp::TIME and dct.start < '${end}'::timestamp::TIME)
  //   or 
  //   (dct.end > '${start}'::timestamp::TIME and dct.start < '${end}'::timestamp::TIME)
  //   or 
  //   (dct.start <= '${start}'::timestamp::TIME and dct.end >= '${end}'::timestamp::TIME)
  // )
}




function getUsersCalendars(userId, calendars) {
  return`select id from calendars ca
  where ca.id in (${calendars})
  and calendar_agent_id = ${userId}`
}

function getDeleteQuery(userId, days, calendars) {
  return`DELETE from "calendarRecurringDay" crd
    WHERE crd.id IN (
      select crd.id
      from "calendarRecurringDay" crd
      inner join "calendars" ca
      on ca.id = crd.calendar_id
      where crd.calendar_id in (${calendars})
      and ca.calendar_agent_id = ${userId}
      and crd.dow = any(array[${days}])
    )`
}

function getQuery({startDate, endDate, serviceId, agentId, distinct}) {
  // startDate = moment.utc(startDate).format();
  // endDate = moment.utc(endDate).format();
  return `select ${distinct ? 'DISTINCT ON (s_date)' : ''} s.date, au.first_name, au.last_name, ds.service_price, dc.calendar_price, ds.service_duration, ds.service_name, calendar_service_id, au.facebook_user_id,
  dc.id as calendar_id, calendar_capacity, dcd.dow, dct.start, dct.end, s.date::timestamp::date as s_date, to_char(s.date, 'YYYY-MM-DD') as raw_date,
  (
     select jsonb_agg(bookings)
     from (
        select db.start, db.end
        from bookings db
        where db.booking_calendar_id = dc.id
        and "time"(db.start) between dct.start and dct.end
        and "time"(db."end") between dct.start and dct.end
        and s.date = date(db.start)
     ) bookings
  ) as bookings,
  (
     select jsonb_agg(override)
     from (
        select cso.start, cso.end
        from "calendarScheduleOverride" cso
        where cso.calendar_id = dc.id
        and "time"(cso.start) between dct.start and dct.end
        and "time"(cso."end") between dct.start and dct.end
        and s.date = date(cso.start)
        and cso.available='f'
     ) override
  ) as unavailable_overrides
  from calendars dc
  inner join "calendarRecurringDay" dcd
  on dcd.calendar_id = dc.id
  inner join users au
  on au.id = dc.calendar_agent_id
  inner join services ds
  on ds.id = calendar_service_id
  inner join "calendarRecurringTime" dct
  on dct.calendar_recurring_day_id = dcd.id
  inner join generate_series('${startDate}'::timestamp,
                                '${endDate}', '1 day') as s(a)
  on 1=1
  where ${serviceId ? 'dc.calendar_service_id ='+ serviceId : ''} ${serviceId && agentId ? 'and dc.calendar_agent_id ='+ agentId : ''} ${!serviceId && agentId ? 'dc.calendar_agent_id ='+ agentId : ''}
  and dcd.dow = EXTRACT(DOW FROM s.date)
  group by dcd.id, au.id, ds.id, dct.id, dc.id, s.date, s.a

  union

  select s.date, au.first_name, au.last_name, ds.service_price, dc.calendar_price, ds.service_duration, ds.service_name, calendar_service_id, au.facebook_user_id,
  dc.id as calendar_id, calendar_capacity, EXTRACT(DOW FROM s.date) as dow, dcd.start::timestamp::time, dcd.end::timestamp::time, s.date::timestamp::date as s_date, to_char(s.date, 'YYYY-MM-DD') as raw_date,
  (
     select jsonb_agg(bookings)
     from (
        select db.start, db.end
        from bookings db
        where db.booking_calendar_id = dc.id
        and "time"(db.start) between "time"(dcd.start) and "time"(dcd.end)
        and "time"(db."end") between "time"(dcd.start) and "time"(dcd.end)
        and db.start::timestamp::date = s.date::timestamp::date
     ) bookings
  ) as bookings,
  (
     select jsonb_agg(override)
     from (
        select cso.start, cso.end
        from "calendarScheduleOverride" cso
        where cso.calendar_id = dc.id
        and "time"(cso.start) between "time"(dcd.start) and "time"(dcd.end)
        and "time"(cso."end") between "time"(dcd.start) and "time"(dcd.end)
        and s.date = date(cso.start)
        and cso.available='f'
     ) override
  ) as unavailable_overrides
  from calendars dc
  inner join users au
  on au.id = dc.calendar_agent_id
  inner join services ds
  on ds.id = calendar_service_id
  inner join generate_series('${startDate}'::timestamp,
                                '${endDate}', '1 day') as s(a)
  on 1=1
  inner join "calendarScheduleOverride" dcd
  on dcd.calendar_id = dc.id and date(dcd.start) = s.date
  where ${serviceId ? 'calendar_service_id ='+ serviceId : ''}
  and dcd.available='t'
  group by dcd.id, au.id, ds.id, dcd.id, dc.id, s.date, s.a`;

}


function sortTimes(array) {
  array = array.sort(function(a, b) {
    a = moment(a, 'H:mm')
    b = moment(b, 'H:mm')
    return a.isBefore(b) ? -1 : a.isAfter(b) ? 1 : 0;
  });
  return groupTimes(array)
}


function groupTimes(times) {
  var interval = 30;
  return _.chain(times).reduce((result, time, i, array) => {
    if(array[i-1]) {
      if(moment(time, 'H:mm').diff(moment(array[i-1], 'H:mm'), 'minutes') > 30) {
        result.push([time])
      } else {
        result[result.length -1].push(time)
      }
    } else {
      result.push([time])
    }
    return result
  }, [])
  .map((group) => {
    return {
      start: group[0],
      end: group[group.length-1]
    }
  }).value();
}

function createCalendarInputs(days, calendars) {
  return _.reduce(calendars, (result, calendar, i, array) => {
     var array = _.map(days, (day) => {
      return {
         calendar_id: calendar,
         dow: day
       }
     })
     result = result.concat(array)
     return result
  }, [])
}

function createTimeInputs(days, times) {
  return _.reduce(days, (result, day, i, array) => {
     times = _.cloneDeep(times);
     var array = _.map(times, (time) => {
      return _.merge(time, {calendar_recurring_day_id: day.id}) 
     })
     result = result.concat(array)
     return result
  }, [])
}


module.exports = availability;
