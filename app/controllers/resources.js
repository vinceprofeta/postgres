'use strict';
var BluebirdPromise = require('bluebird');
var uuid = require('node-uuid');
var moment = require('moment');
var _ = require('lodash');

var bookshelf = require('../../db/bookshelf');
var Resources = bookshelf.model('resources');
var Memberships = bookshelf.model('memberships');
var Users = bookshelf.model('users');
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

resources.updateAppFees = function(id, params) {
  var updatedObj = {};
  if (params.appFeePercentageTake) {
    updatedObj.appFeePercentageTake = params.appFeePercentageTake;
  }

  if (params.appFeeFlatFeeTake) {
    updatedObj.appFeeFlatFeeTake = params.appFeeFlatFeeTake;
  }

  return bookshelf.knex('resources')
  .where('id', '=', id)
  .update(updatedObj)
}


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


resources.getMembers = function(id, query, role) {
  var queryObject = {
    membership_resource_id: query.resource,
    membership_service_id: query.service,
    status: query.status
  }
  return bookshelf.knex('roles')
  .where('roleName', '=', role).then(function(role) {
    var role = _.get(role, '[0].id');
    queryObject.membership_role_id = role;
    return Memberships.where(_.pickBy(queryObject, _.identity)).fetchAll({
      withRelated: [
        {'user': function(qb) {
          qb.column('id', 'firstName', 'lastName')
        }},
        {'role': function(qb) {
          qb.column('id', 'roleName')
        }}
      ],
    }).catch(function(err) {
      console.log(err)
    })
  });
};




module.exports = resources;
