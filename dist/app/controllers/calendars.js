'use strict';

var BluebirdPromise = require('bluebird');
var _ = require('lodash');

var knex = require('../../db/knex');
var st = require('knex-postgis')(knex);

var bookshelf = require('../../db/bookshelf');
var Calendars = bookshelf.model('calendars');
var Services = bookshelf.model('services');
// var Roles //= require('../models/roles');

var calendars = {};

calendars.getAll = function (limit, offset) {
  return Calendars.fetchAll({});
};

calendars.getCalendars = function (query) {
  query = query || {};
  var queryObject = {
    // calendar_resource_id: query.resource,
    calendar_agent_id: query.agent,
    calendar_service_id: query.service
  };

  return Calendars.where(_.pickBy(queryObject, _.identity)).fetchAll({
    withRelated: ['agent', 'service', 'service.skill'] });
  // .limit(query.limit || 10)
  // .skip(query.offset || 0)
  // .populate('instructor skill')
};

calendars.getCalendarsBySkill = function (query) {
  // query = query || {}
  // var  queryObject = {
  //   calendar_resource_id: query.resource,
  //   calendar_agent_id: query.agent,
  //   calendar_service_id: query.service
  // };
  return bookshelf.knex('services').where('service_skill_id', Number(query.skill)).join('calendars', 'services.id', '=', 'calendars.calendar_service_id')
  // .select('calendars.calendar_agent_id')
  .join('users', 'calendars.calendar_agent_id', '=', 'users.id').join('skills', 'services.service_skill_id', '=', 'skills.id').select('skills.image as skill_image', 'calendars.calendar_price', 'calendars.calendar_agent_id', 'users.facebook_user_id', 'users.first_name', 'users.last_name', 'services.image', 'services.service_name', 'services.service_price', 'services.id', 'calendars.id as calendar_id');
  // Calendars.where(_.pickBy(queryObject, _.identity)).fetchAll({
  //   withRelated: ['agent'], //'resource', 'service'
  // })
  // .limit(query.limit || 10)
  // .skip(query.offset || 0)
  // .populate('instructor skill')
};

calendars.getPopularCalendars = function (query) {
  return Calendars.fetchAll({});
};

calendars.getById = function (id) {
  return Calendars.where('id', id).fetch({
    withRelated: ['service.skill', 'agent', { service: function service(qb) {
        qb.select('*', st.x(st.centroid('point')).as('x'), st.y(st.centroid('point')).as('y'));
      } }] });
};

calendars.add = function (data, trx) {
  trx = trx ? { transacting: trx } : {};
  var calendar = {
    calendar_agent_id: data.agent,
    calendar_service_id: data.service,
    calendar_capacity: data.capacity,
    calendar_price: data.price
  };
  return new Calendars(calendar).save(null, trx);
};

calendars.updateById = function (id, params) {
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

  return bookshelf.knex('calendars').where('id', '=', id).update(updatedObj);
};

module.exports = calendars;