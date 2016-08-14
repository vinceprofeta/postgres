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
    skill: query.skill,
    service_resource_id: query.resource,
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

  booking = _.merge(booking, {booking_resource_id: id})
  return bookshelf.knex('bookings').insert(booking).returning('*')
};




bookings.updateById = function(id, params) {
  bookingDate: '',
    bookingStart: '',
    bookingEnd: '',
    bookingDuration: '',
    bookingCapacity: '',
    bookingPrice: '',
    bookingStatus: '',
    notes: '',
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






// bookings.addSessionsForListing = function(listingId, times) {
//   return bookings.getById(listingId)
//   .then(function(listing) {
//     var addedSessions = _.map(times, function(time) {
//       return createSession({
//         times: time,
//         listing: listing
//       })
//     });
//     console.log(addedSessions)
//     return Sessions.create(addedSessions, function (err, addedSession) {
//       if (err) { throw err }
//       return addedSession;
//     });
//   })
//   .catch(function() {
//     throw new Error({error: 'listing not found', code: 404})
//   })
// };


// function createSession(obj) {
//   listing = listing || {};
//   var times = _.get(obj, 'times', {})
//   var listing = _.get(obj, 'listing', {})
  
//   return new Sessions({
//     notes: '',
//     dateAndTime: times.dateAndTime,
//     date:  times.date,
//     time: {
//     start: times.time,
//     end: moment(times.time, 'H:mm').add(listing.duration || 30, 'minutes').format('H:mm')
//     },      
//     enrolled: [],
//     listing: listing._id
//   });
// }




module.exports = bookings;
