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
    bookings_resource_id: query.resource,
    bookings_agent_id: query.agent,
    bookings_service_id: query.service,
    bookingDuration: query.duration,
    bookingCapacity: query.capacity,
    bookingPrice: query.price,
    bookingStatus: query.status,

    // TODO BEFORE AND AFTER QUERIES
    bookingDate: query.date,
    bookingStart: query.start,
    bookingEnd: query.end,
  };

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
    bookings_resource_id: '',
    bookings_agent_id: '',
    bookings_service_id: '',
    bookingDate: '',
    bookingStart: '',
    bookingEnd: '',
    bookingDuration: '',
    bookingCapacity: '',
    bookingPrice: '',
    bookingStatus: '',
    notes: '',
  };

  return bookshelf.knex('bookings').insert(booking).returning('*')
};




bookings.updateById = function(id, params) {
  var updatedObj = {};

  if (params.bookingDate) {
    updatedObj.bookingDate = params.bookingDate;
    // SEND PUSH AND UPDATE USERS
  }

  if (params.bookingStart) {
    updatedObj.bookingStart = params.bookingStart;
    // SEND PUSH AND UPDATE USERS
  }

  if (params.bookingEnd) {
    updatedObj.bookingEnd = params.bookingEnd;
    // SEND PUSH AND UPDATE USERS
  }

  if (params.bookingDuration) {
    updatedObj.bookingDuration = params.bookingDuration;

  }

  if (params.bookingCapacity) {
    updatedObj.bookingCapacity = params.bookingCapacity;
  }

  if (params.bookingPrice) {
    updatedObj.bookingPrice = params.bookingPrice;
    // SEND PUSH AND UPDATE USERS
  }

  if (params.bookingStatus) {
    updatedObj.bookingStatus = params.bookingStatus;
  }

  if (params.notes) {
    updatedObj.notes = params.notes;
  }

  if (params.customData) {
    updatedObj.customData = params.customData;
  }

  return bookshelf.knex('bookings')
  .where('id', '=', id)
  .update(updatedObj)
};




module.exports = bookings;
