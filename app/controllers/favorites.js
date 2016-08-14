'use strict';

var BluebirdPromise = require('bluebird');
var uuid = require('node-uuid');
var moment = require('moment');
var _ = require('lodash');

var bookshelf = require('../../db/bookshelf');
var Favorites = bookshelf.model('favorites');

var favorites = {};

favorites.getAll = function(queryObject) {
  return Favorites.fetchAll({
    withRelated: ['service', 'user'],
  })
};

favorites.getUsersFavroites = function(userId) {
  return Favorites.where('user_id', userId).fetch({
    withRelated: ['service'],
  })
  //   .limit(limit || 10)
  //   .skip(offset || 0)
};


favorites.add = function(userId, service) {
  var fav = {
    user_id: userId,
    favorites_service_id: service.id
  }
  return bookshelf.knex('favorites').insert(fav).returning('*')
};



module.exports = favorites;
