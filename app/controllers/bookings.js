'use strict';

var BluebirdPromise = require('bluebird');
var uuid = require('node-uuid');
var moment = require('moment');
var _ = require('lodash');

var bookshelf = require('../../db/bookshelf');
var Bookings = bookshelf.model('services');
var Bookings = bookshelf.model('bookings');
// var Roles //= require('../models/roles');

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
    start: query.start,
    end: query.end
  };

  return bookshelf.knex.raw(`
    select bk.*, cd.*, us.first_name, us.last_name
    from bookings bk
    inner join calendars cd
    on cd.id = bk.id
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
  var id = data.resource;
  var params = data.params;
  // resource id - GET reource
  var booking = {
    booking_calendar_id: '',
    booking_capacity: '',
    bookingPrice: '',
    booking_status: '',
    start: '',
    end: ''
  };

  return bookshelf.knex('bookings').insert(booking).returning('*')
};




bookings.updateById = function(id, params) {
  var updatedObj = {};

  if (params.start) {
    updatedObj.start = params.start;
    // SEND PUSH AND UPDATE USERS
  }

  if (params.end) {
    updatedObj.end = params.end;
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
