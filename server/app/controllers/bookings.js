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
  var  queryObject = {
    // bookings_resource_id: query.resource,
    // bookings_agent_id: query.agent,
    booking_calendar_id: query.service,
    
    booking_capacity: query.capacity,
    bookingPrice: query.price,
    booking_status: query.status,

    // TODO BEFORE AND AFTER QUERIES
    start:query.start, // moment.utc(query.start).format(),
    end: query.end //moment.utc(query.end).format()
  };

  return bookshelf.knex.raw(`
    select sv.*, bk.*, cd.*, us.first_name, us.last_name
    from bookings bk
    inner join calendars cd
    on cd.id = bk.id
    inner join services sv
    on sv.id = cd.calendar_service_id
    inner join users us
    on cd.calendar_agent_id = us.id
    where cd.id = bk.booking_calendar_id
  `).then((result) => {
    return result.rows;
  })

  return Bookings.where(_.pickBy(queryObject, _.identity)).fetchAll({
    // withRelated: ['resource', 'skill'],
  })
  // .limit(query.limit || 10)
  // .skip(query.offset || 0)
  // .populate('instructor skill')

};


bookings.getById = function(id) {
  return Bookings.where('id', id).fetch({
    // withRelated: ['resource', 'skill'],
  })
};


bookings.add = function(data) {
  // TODO add required on calendar
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
        reject({error: 'A booking already exists in the time slot'});
        return;
      }
    
      const booking = {
        booking_calendar_id: calendar.id,
        bookings_agent_id: calendar.calendar_agent_id,
        booking_capacity: calendar.calendar_capacity || calendar.service_capacity,
        booking_status: '',
        start: params.start, //moment.utc(params.start).format(),
        end: params.end //moment.utc(params.end).format()
      };
      
      bookshelf.knex.transaction(async function(trx) {
        try {
          const bookingDb = await bookshelf.knex('bookings').insert(booking).transacting(trx).returning('*')
          const enrolled = await bookshelf.knex('enrolledUsers').insert({
            booking_id: bookingDb[0].id,
            booking_user_id: user
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




module.exports = bookings;
