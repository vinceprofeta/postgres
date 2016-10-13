'use strict';

var BluebirdPromise = require('bluebird');
var uuid = require('node-uuid');
var moment = require('moment');
var _ = require('lodash');
var formatServiceAndResource = require('../utils/formatServiceAndResource.js');

var bookshelf = require('../../db/bookshelf');
var knex = require('../../db/knex');
var st = require('knex-postgis')(knex);

var Resources = bookshelf.model('resources');
var Memberships = bookshelf.model('memberships');
var Users = bookshelf.model('users');
var Calendars = bookshelf.model('calendars');
var Services = bookshelf.model('services');
// var Roles = bookshelf.model('memberships');


var resources = {};

resources.getAll = function (limit, offset) {
  return Resources.fetchAll({});
  // .limit(limit || 10)
  // .skip(offset || 0)
  // .populate('instructor skill')
  // .exec(function(err, resources) {
  //   return resources;
  // });
};

resources.getResources = function (query) {
  return Resources.fetchAll({});
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

resources.getPopularResources = function (query) {
  return Resources.fetchAll({});
};

resources.getById = function (id) {
  return Resources.where('id', id).fetch({});
};

resources.updateAppFees = function (id, params) {
  var updatedObj = {};
  if (params.appFeePercentageTake) {
    updatedObj.appFeePercentageTake = params.appFeePercentageTake;
  }

  if (params.appFeeFlatFeeTake) {
    updatedObj.appFeeFlatFeeTake = params.appFeeFlatFeeTake;
  }

  return bookshelf.knex('resources').where('id', '=', id).update(updatedObj);
};

resources.updateById = function (id, params) {
  var updatedObj = {};
  if (params.name) {
    updatedObj.name = params.name;
  }

  if (params.booking_percent_take) {
    updatedObj.booking_percent_take = params.booking_percent_take;
  }

  if (params.booking_flat_fee_take) {
    updatedObj.booking_flat_fee_take = params.booking_flat_fee_take;
  }

  if (params.description) {
    updatedObj.description = params.description;
  }

  if (params.point) {
    updatedObj.point = params.point;
  }

  if (params.cancellation_policy_percent_take) {
    updatedObj.cancellation_policy_percent_take = params.cancellation_policy_percent_take;
  }

  if (params.cancellation_policy_flat_fee_take) {
    updatedObj.cancellation_policy_flat_fee_take = params.cancellation_policy_flat_fee_take;
  }

  if (params.cancellation_policy_window) {
    updatedObj.cancellation_policy_window = params.cancellation_policy_window;
  }

  if (params.street_address) {
    updatedObj.street_address = params.street_address;
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

  return bookshelf.knex('resources').where('id', '=', id).update(updatedObj);
};

resources.add = function (resource) {
  return bookshelf.knex('resources').insert(resource).returning('*');
};

resources.getMembers = function (id, query, role) {
  var queryObject = {
    membership_resource_id: query.resource,
    membership_service_id: query.service,
    status: query.status
  };
  return bookshelf.knex('roles').where('role_name', '=', role).then(function (role) {
    var role = _.get(role, '[0].id');
    queryObject.membership_role_id = role;
    return Memberships.where(_.pickBy(queryObject, _.identity)).fetchAll({
      withRelated: [{ 'user': function user(qb) {
          qb.column('id', 'first_name', 'last_name');
        } }, { 'role': function role(qb) {
          qb.column('id', 'role_name');
        } }]
    }).catch(function (err) {
      console.log(err);
    });
  });
};

resources.addWithServiceMembershipCalendar = function (user, r, s) {
  var _formatServiceAndReso = formatServiceAndResource(user, s, r);

  var resource = _formatServiceAndReso.resource;
  var service = _formatServiceAndReso.service;

  return new BluebirdPromise(function (resolve, reject) {
    bookshelf.knex.transaction(function (trx) {

      bookshelf.knex('resources').transacting(trx).insert(resource).returning('id').then(function (resourceAdded) {
        resourceAdded = _.get(resourceAdded, '[0]');

        return bookshelf.knex('skills').transacting(trx).where('id', '=', service.service_skill_id).then(function (skill) {

          service.service_resource_id = resourceAdded;
          service.service_skill_id = _.get(skill, '[0].id');
          service.image = service.image || _.get(skill, '[0].image');

          return new Services(service).save(null, { transacting: trx }).then(function (serviceAdded) {
            serviceAdded = _.get(serviceAdded, 'attributes');

            return bookshelf.knex('roles').transacting(trx).where('role_name', '=', 'resource-admin').returning('id').then(function (role) {
              role = _.get(role, '[0].id');
              if (!role) {
                throw new Error({ error: 'role does not exist' });
              }
              return bookshelf.knex('memberships').transacting(trx).insert({
                membership_role_id: role,
                status: 'approved',
                membership_resource_id: Number(resourceAdded),
                membership_user_id: Number(user)
              }).returning('*').then(function (membership) {
                var calendar = {
                  calendar_agent_id: Number(user),
                  calendar_service_id: Number(serviceAdded.id),
                  // calendar_resource_id: Number(resourceAdded),
                  point: service.point || resource.point,
                  calendar_capacity: service.capacity, //REMOVEABLE
                  calendar_price: service.price // REMOVEABLE
                };
                return new Calendars(calendar).save(null, { transacting: trx });
              });
            });
          });
        });
      }).then(trx.commit).catch(trx.rollback);
    }).then(function (resp) {
      resolve({ success: true });
    }).catch(function (err) {
      // console.log(err)
      reject({ error: err });
    });
  });

  return bookshelf.knex('resources').insert(resource).returning('*');
};

module.exports = resources;