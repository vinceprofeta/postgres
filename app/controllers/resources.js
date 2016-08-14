'use strict';
var BluebirdPromise = require('bluebird');
var uuid = require('node-uuid');
var moment = require('moment');
var _ = require('lodash');

var bookshelf = require('../../db/bookshelf');
var Resources = bookshelf.model('resources');
var Memberships = bookshelf.model('memberships');
// var Roles = bookshelf.model('memberships');

var resources = {};

resources.getAll = function(limit, offset) {
  return Resources.fetchAll({})
    // .limit(limit || 10)
    // .skip(offset || 0)
    // .populate('instructor skill')
    // .exec(function(err, resources) {
    //   return resources;
    // });
};

resources.getResources = function(query) {
  return Resources.fetchAll({})
  // by location
  // query = query || {}
  // var  queryObject = {
  //   instructor: query.instructor,
  //   skill: query.skill,
  // };
  // if (query.endDate && query.startDate) {
  //   queryObject.date = {
  //     $gte: query.startDate,
  //     $lte: query.endDate
  //   }
  // }
  // return Resources.find(_.pickBy(queryObject, _.identity))
  //   .limit(query.limit || 10)
  //   .skip(query.offset || 0)
  //   .populate('instructor skill')
  //   .exec(function(err, resources) {
  //     return resources;
  //   });
};

resources.getPopularResources = function(query) {
  return Resources.fetchAll({})
};

resources.getById = function(id) {
  return Resources.where('id', id).fetch({})
};


resources.updateById = function(id, params) {
  var updatedObj = {};
  if (params.resourceName) {
    updatedObj.resourceName = params.resourceName;
  }

  if (params.bookingPercentTake) {
    updatedObj.bookingPercentTake = params.bookingPercentTake;
  }

  if (params.bookingFlatFeeTake) {
    updatedObj.bookingFlatFeeTake = params.bookingFlatFeeTake;
  }

  if (params.description) {
    updatedObj.description = params.description;
  }

  if (params.point) {
    updatedObj.point = params.point;
  }

  if (params.cancellationPolicyPercentTake) {
    updatedObj.cancellationPolicyPercentTake = params.cancellationPolicyPercentTake;
  }

  if (params.cancellationPolicyFlatFeeTake) {
    updatedObj.cancellationPolicyFlatFeeTake = params.cancellationPolicyFlatFeeTake;
  }

  if (params.cancellationPolicyWindow) {
    updatedObj.cancellationPolicyWindow = params.cancellationPolicyWindow;
  }

  if (params.streetAddress) {
    updatedObj.streetAddress = params.streetAddress;
  }

  if (params.city) {
    updatedObj.city = params.city;
  }

  if (params.state) {
    updatedObj.state = params.state;
  }

  if (params.zipcode) {
    updatedObj.zipcode = params.zipcode;
  }

  if (params.phone) {
    updatedObj.phone = params.phone;
  }

  if (params.email) {
    updatedObj.email = params.email;
  }

  if (params.website) {
    updatedObj.website = params.website;
  }

  return bookshelf.knex('resources')
  .where('id', '=', id)
  .update(updatedObj)
};


resources.add = function(resource) {
  return bookshelf.knex('resources').insert(resource).returning('*')
};


resources.getAgents = function(id, query, role) {
  var queryObject = {
    membership_resource_id: query.resource,
    membership_service_id: query.service,
    membership_role_id: query.role,
    status: query.status
  }
  console.log(role)
  return bookshelf.knex('roles').select('id')
  .where('roleName', '=', role)

  // return Memberships.fetchAll(_.pickBy(queryObject, _.identity))
};




module.exports = resources;
