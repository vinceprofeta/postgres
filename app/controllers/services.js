'use strict';

var Services //= require('../models/services');
var Roles //= require('../models/roles');
var Sessions //= require('../models/sessions');

var BluebirdPromise = require('bluebird');
var uuid = require('node-uuid');
var moment = require('moment');
var _ = require('lodash');

var services = {};

services.getAll = function(limit, offset) {
  return Services.find({})
    .limit(limit || 10)
    .skip(offset || 0)
    .populate('instructor skill')
    .exec(function(err, services) {
      return services;
    });
};

services.getServices = function(query) {
  query = query || {}
  var  queryObject = {
    instructor: query.instructor,
    skill: query.skill,
  };
  if (query.endDate && query.startDate) {
    queryObject.date = {
      $gte: query.startDate,
      $lte: query.endDate
    }
  }
  return Services.find(_.pickBy(queryObject, _.identity))
    .limit(query.limit || 10)
    .skip(query.offset || 0)
    .populate('instructor skill')
    .exec(function(err, services) {
      return services;
    });
};

services.getById = function(id) {
  return Services.findOne({
    _id: id
  })
  .populate('instructor skill')
  .exec(function(err, user) {
    return user;
  });
};


services.updateById = function(id, params) {
  var updatedObj = {};
  var find = {_id: id};

  
  return Services.update(find, updatedObj)
    .exec(function(err, updatedObj) {
      if(err) {
        throw err; 
      }else{
        return updatedObj;
      }
    });
};


services.add = function(session) {
  var newListing = new Services(session);
  return newListing.save()
};

services.addSessionsForListing = function(listingId, times) {
  return services.getById(listingId)
  .then(function(listing) {
    var addedSessions = _.map(times, function(time) {
      return createSession({
        times: time,
        listing: listing
      })
    });
    console.log(addedSessions)
    return Sessions.create(addedSessions, function (err, addedSession) {
      if (err) { throw err }
      return addedSession;
    });
  })
  .catch(function() {
    throw new Error({error: 'listing not found', code: 404})
  })
};


function createSession(obj) {
  listing = listing || {};
  var times = _.get(obj, 'times', {})
  var listing = _.get(obj, 'listing', {})
  
  return new Sessions({
    notes: '',
    dateAndTime: times.dateAndTime,
    date:  times.date,
    time: {
    start: times.time,
    end: moment(times.time, 'H:mm').add(listing.duration || 30, 'minutes').format('H:mm')
    },      
    enrolled: [],
    listing: listing._id
  });
}




module.exports = services;
