'use strict';

var Promise = require('bluebird');
var uuid = require('node-uuid');
var moment = require('moment');
var _ = require('lodash');

var bookshelf = require('../../db/bookshelf');
var Bookings = bookshelf.model('services');
var Bookings = bookshelf.model('bookings');
var availability = require('./availability');

var bookings = {};

bookings.getAll = function(limit, offset) {
  return Bookings.fetchAll({})
};

bookings.getBookings = function(query) {
  query = query || {}
  query.status = query.status || ''
  const status = query.status.split(',').map(function (ele) { return "'" + ele + "'"; }).join(',');

  return bookshelf.knex.raw(`
    select sv.image, sv.service_name, bk.*, us.first_name, us.last_name,
    (SELECT array_to_json(array_agg(row_to_json(sub)))
      FROM ( 
        select eu.id, eu.first_name from
        "enrolledUsers" euj
        inner join users eu
        on eu.id = euj.booking_user_id
        WHERE bk.id = euj.booking_id
      ) as sub
    ) AS enrolled

    from bookings bk
    inner join calendars cd
    on cd.id = bk.booking_calendar_id
    inner join services sv
    on sv.id = cd.calendar_service_id
    inner join users us
    on cd.calendar_agent_id = us.id
    where bk.bookings_agent_id = '${query.agent}'
    and bk.booking_status in (${status})
    and bk.start > '${query.start}'::timestamp and bk.start < '${query.end}'::timestamp
    order by bk.start asc
  `)
  .then((result) => {
    return result.rows
  })

  // .limit(query.limit || 10)
  // .skip(query.offset || 0)
  // .populate('instructor skill')

};

bookings.getUsersBookings = function(query) {
  query = query || {}
  query.status = query.status || ''
  const status = query.status.split(',').map(function (ele) { return "'" + ele + "'"; }).join(',');
  return bookshelf.knex.raw(`
    select * from bookings bk
    where bk.booking_status in (${status})
    and bk.start > '${query.start}'::timestamp and bk.start < '${query.end}'::timestamp
    and bk.id in (
      select eu.booking_id from "enrolledUsers" eu 
      where eu.booking_user_id = '${query.user}'
    )
    order by bk.start asc
  `)
  .then((result) => {
    return result.rows
  })
}


bookings.getBookingsThatNeedCompletion = function(query) {
  query = query || {}
  return bookshelf.knex.raw(`
    select * from bookings bk
    where bk.bookings_agent_id = '${query.agent}'
    and bk.booking_status != 'complete'
    and bk.end < '${query.date}'::timestamp
  `)
  .then((result) => {
    return result.rows
  })
}

bookings.getBookingsForReview = function(query) {
  query = query || {}
  query.status = query.status || ''
  const status = query.status.split(',').map(function (ele) { return "'" + ele + "'"; }).join(',');
  return bookshelf.knex.raw(`
    select *
    from bookings bk
    join "enrolledUsers" eus 
    on eus.booking_id = bk.id 
    and eus.booking_user_id = '${query.agent}'
    and eus.status = 'enrolled'
    where bk.booking_status = 'complete'
    and eus.status = 'enrolled'
    
    order by bk.start asc
  `)
  .then((result) => {
    return result.rows
  })
}


bookings.getById = function(id) {
  return bookshelf.knex.raw(`
    select sv.image, sv.service_name, sv.image, row_to_json(cd) as calendar, bk.*, us.first_name, us.last_name, us.facebook_user_id,
    (SELECT array_to_json(array_agg(row_to_json(sub)))
      FROM ( 
        select eu.id, eu.first_name from
        "enrolledUsers" euj
        inner join users eu
        on eu.id = euj.booking_user_id
        WHERE bk.id = euj.booking_id
      ) as sub
    ) AS enrolled

    from bookings bk
    inner join calendars cd
    on cd.id = bk.booking_calendar_id
    inner join services sv
    on sv.id = cd.calendar_service_id
    inner join users us
    on cd.calendar_agent_id = us.id
    WHERE bk.id = ${id}
  `).then((result) => {
    if (_.get(result, 'rows[0]')) {
      return _.get(result, 'rows[0]')
    } else {
      throw new Error('Booking Not Found')
    }
  })
};


bookings.add = function(data) {
  // TODO add required on calendar
  // TODO user only enrolled once?
  return new Promise(async function(resolve, reject) {
    var user = data.user;
    var params = data.calendar;
    try {
      let calendar = await bookshelf.knex('calendars')
        .where({'calendars.id': params.calendar_id})
        .join('services', 'services.id', '=', 'calendars.calendar_service_id')
        .select('calendars.*', 'services.service_capacity')
      calendar = calendar[0];

      const noConflicts = await availability.isUserAvailableForBooking({start: params.start, end: params.end, agent: calendar.calendar_agent_id})
      if (!noConflicts) {
        reject({error: 'the instructor is no longer available at this time.'});
        return;
      }
    
      const booking = {
        booking_calendar_id: calendar.id,
        bookings_agent_id: calendar.calendar_agent_id,
        booking_capacity: calendar.calendar_capacity || calendar.service_capacity,
        booking_status: 'upcoming',
        start: params.start, //moment.utc(params.start).format(),
        end: params.end //moment.utc(params.end).format()
      };
      
      bookshelf.knex.transaction(async function(trx) {
        try {
          const bookingDb = await bookshelf.knex('bookings').insert(booking).transacting(trx).returning('*')
          const enrolled = await bookshelf.knex('enrolledUsers').insert({
            booking_id: bookingDb[0].id,
            booking_user_id: user,
            status: 'enrolled'
          }).returning('*').transacting(trx)
          trx.commit
          resolve(enrolled)
        } catch(err) {
          trx.rollback
          throw err;
        }
      });

    } catch (err) {
      console.log(err)
      reject(err)
    }
  });
};




bookings.updateById = function(id, params) {
  var updatedObj = {};

  if (params.start) {
    updatedObj.start = moment.utc(params.start).format();
    // SEND PUSH AND UPDATE USERS
  }

  if (params.end) {
    updatedObj.end = moment.utc(params.end).format();
    // SEND PUSH AND UPDATE USERS
    // TODO check to make sure this new time is available
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

  return bookshelf.knex('bookings')
  .where('id', '=', id)
  .update(updatedObj)
};


bookings.cancel = function(id, userId) {
  // TODO - option to cancel after the fact
  // user is instructor
  return bookshelf.knex('bookings')
  .where('id', '=', id)
  .andWhere('bookings_agent_id', '=', userId)
  .andWhere('start', '<', moment.utc().format())
  .update({booking_status: 'cancelled'})
};

bookings.drop = async function(id, userId) {
  // TODO
  // cancellation fee?
  // cancel booking if noone else is in booking
  return bookshelf.knex('enrolledUsers')
  .where('booking_id', '=', id)
  .andWhere('booking_user_id', '=', userId)
  .andWhere('start', '<', moment.utc().format())
  .update({status: 'dropped'})
};

bookings.complete = async function(id, userId) {
  // TODO
  // push notifications
  return bookshelf.knex('bookings')
  .where('id', '=', id)
  .andWhere('bookings_agent_id', '=', userId)
  .andWhere('start', '>', moment.utc().format())
  .update({status: 'complete'})
};




module.exports = bookings;
