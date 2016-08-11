'use strict';
var BluebirdPromise = require('bluebird');
var uuid = require('node-uuid');
var moment = require('moment');
var _ = require('lodash');

var bookshelf = require('../../db/bookshelf');
var Resources = bookshelf.model('resources');
// var Roles //= require('../models/roles');
// var Sessions //= require('../models/sessions');

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

resources.getById = function(id) {
  return Conversations.where('id', id).fetch({})
};


resources.updateById = function(id, params) {
  var updatedObj = {};
  return bookshelf.knex('conversations')
  .where('id', '=', id)
  .update(updatedObj)
};


resources.add = function(resource) {
  return bookshelf.knex('resources').insert(resource).returning('*')
};



module.exports = resources;
