'use strict';

var BluebirdPromise = require('bluebird');
var uuid = require('node-uuid');
var moment = require('moment');
var _ = require('lodash');

var bookshelf = require('../../db/bookshelf');
var Resources = bookshelf.model('resources');
var Memberships = bookshelf.model('memberships');
var Users = bookshelf.model('users');
var Calendars = bookshelf.model('calendars');
var Services = bookshelf.model('services');
// var Roles = bookshelf.model('memberships');

var memberships = {};

memberships.getAll = function (limit, offset) {
  return Memberships.fetchAll({});
  // .limit(limit || 10)
  // .skip(offset || 0)
  // .populate('instructor skill')
  // .exec(function(err, resources) {
  //   return resources;
  // });
};

memberships.getMemberships = function (query) {
  query = query || {};
  var queryObject = {
    membership_user_id: query.user,
    service_resource_id: query.resource
  };
  return Memberships.where(_.pickBy(queryObject, _.identity)).fetchAll({
    withRelated: ['user', 'role']
  });
};

memberships.getById = function (id) {
  return Memberships.where('id', id).fetch({});
};

memberships.updateById = function (id, params) {
  var updatedObj = {};
  if (params.default) {
    updatedObj.default = params.default;
  }

  if (params.status) {
    updatedObj.status = params.status;
  }

  return bookshelf.knex('memberships').where('id', '=', id).update(updatedObj);
};

memberships.add = function (membership) {
  return bookshelf.knex('memberships').insert(membership).returning('*');
};

module.exports = memberships;