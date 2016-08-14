'use strict';

var Services //= require('../models/services');
var Roles //= require('../models/roles');
var Sessions //= require('../models/sessions');

var BluebirdPromise = require('bluebird');
var uuid = require('node-uuid');
var moment = require('moment');
var _ = require('lodash');

var bookshelf = require('../../db/bookshelf');
var Services = bookshelf.model('services');
// var Roles //= require('../models/roles');

var services = {};

services.getAll = function(limit, offset) {
  return Services.fetchAll({})
};

services.getServices = function(query) {
  query = query || {}
  var  queryObject = {
    skill: query.skill,
    service_resource_id: query.resource,
  };

  return Services.where(_.pickBy(queryObject, _.identity)).fetchAll({
    // withRelated: ['resource', 'skill'],
  })
  // .limit(query.limit || 10)
  // .skip(query.offset || 0)
  // .populate('instructor skill')

};


services.getPopularServices = function(query) {
  return Services.fetchAll({})
};


services.getById = function(id) {
  return Services.where('id', id).fetch({
    // withRelated: ['resource', 'skill'],
  })
};


services.add = function(data) {
  var id = data.resource;
  var params = data.params;
  // resource id - GET reource
  var service = { 
    serviceDescription: "TEST service description",
    serviceType: "private",
    serviceName: "Half",
    active: true,
    image: "test",
    serviceCapacity: 3,
    serviceDuration: 30,
    servicePrice: 60
  };
  service = _.merge(service, {service_resource_id: id})
  return bookshelf.knex('services').insert(service).returning('*')
};




services.updateById = function(id, params) {
  var updatedObj = {};

  if (params.serviceDescription) {
    updatedObj.serviceDescription = params.serviceDescription;
  }

  if (params.serviceType) {
    updatedObj.serviceType = params.serviceType;
  }

  if (params.serviceName) {
    updatedObj.serviceName = params.serviceName;
  }

  if (params.active) {
    updatedObj.active = params.active;
  }

  if (params.image) {
    updatedObj.image = params.image;
  }

  if (params.serviceCapacity) {
    updatedObj.serviceCapacity = params.serviceCapacity;
  }

  if (params.serviceDuration) {
    updatedObj.serviceDuration = params.serviceDuration;
  }

  if (params.servicePrice) {
    updatedObj.servicePrice = params.servicePrice;
  }

  return bookshelf.knex('services')
  .where('id', '=', id)
  .update(updatedObj)
};






// services.addSessionsForListing = function(listingId, times) {
//   return services.getById(listingId)
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




module.exports = services;
