'use strict';

var BluebirdPromise = require('bluebird');
var _ = require('lodash');

var bookshelf = require('../../db/bookshelf');
var Calendars = bookshelf.model('calendars');
var Services = bookshelf.model('services');
// var Roles //= require('../models/roles');

var calendars = {};

calendars.getAll = function(limit, offset) {
  return Calendars.fetchAll({})
};

calendars.getCalendars = function(query) {
  query = query || {}
  var  queryObject = {
    calendar_resource_id: query.resource,
    calendar_agent_id: query.agent,
    calendar_service_id: query.service
  };

  return Calendars.where(_.pickBy(queryObject, _.identity)).fetchAll({
    withRelated: ['agent'], //'resource', 'service'
  })
  // .limit(query.limit || 10)
  // .skip(query.offset || 0)
  // .populate('instructor skill')

};

calendars.getCalendarsBySkill = function(query) {
  // query = query || {}
  // var  queryObject = {
  //   calendar_resource_id: query.resource,
  //   calendar_agent_id: query.agent,
  //   calendar_service_id: query.service
  // };
  return bookshelf.knex('services')
  .where('service_skill_id',  Number(query.skill))
  .join('calendars', 'services.id', '=', 'calendars.calendar_service_id')
  // .select('calendars.calendar_agent_id')
  .join('users', 'calendars.calendar_agent_id', '=', 'users.id')
  .select('calendars.calendarPrice', 'calendars.calendar_agent_id', 'users.facebookUserId', 'users.firstName', 'users.lastName', 'services.serviceName', 'services.servicePrice', 'services.id', 'calendars.id as calendarId')
  // Calendars.where(_.pickBy(queryObject, _.identity)).fetchAll({
  //   withRelated: ['agent'], //'resource', 'service'
  // })
  // .limit(query.limit || 10)
  // .skip(query.offset || 0)
  // .populate('instructor skill')

};


calendars.getPopularCalendars = function(query) {
  return Calendars.fetchAll({})
};


calendars.getById = function(id) {
  return Calendars.where('id', id).fetch({
    withRelated: ['resource', 'service', 'agent'],
  })
};


calendars.add = function(data) {
  var serviceId =  1 //  data.service;
  var resourceId =  1 //  data.resource;
  var agentId =  1 //  data.agent;
  var params = data.params;
  // resource id - GET reource
  var calendar = {   
    calendarCapacity: 1,
    calendarPrice: 0,
    // point
  };
  calendar = _.merge(calendar, {
    calendar_agent_id: agentId, 
    calendar_service_id: serviceId, 
    calendar_resource_id: resourceId
  });
  return bookshelf.knex('calendars').insert(calendar).returning('*')
};




calendars.updateById = function(id, params) {
  var updatedObj = {};

  if (params.point) {
    updatedObj.point = params.point;
  }

  if (params.calendarCapacity) {
    updatedObj.calendarCapacity = params.calendarCapacity;
  }

  if (params.calendarPrice) {
    updatedObj.calendarPrice = params.calendarPrice;
  }

  if (params.delete_date) {
    updatedObj.delete_date = params.delete_date;
  }

  return bookshelf.knex('calendars')
  .where('id', '=', id)
  .update(updatedObj)
};






//   return calendars.getById(listingId)
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




module.exports = calendars;
