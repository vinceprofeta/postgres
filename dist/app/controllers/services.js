'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var Services; //= require('../models/services');
var Roles; //= require('../models/roles');
var Sessions; //= require('../models/sessions');

var BluebirdPromise = require('bluebird');
var uuid = require('node-uuid');
var moment = require('moment');
var _ = require('lodash');
var formatServiceAndResource = require('../utils/formatServiceAndResource');
var cloudinary = require('../utils/cloudinary');

var bookshelf = require('../../db/bookshelf');
var Services = bookshelf.model('services');
var Calendars = bookshelf.model('calendars');
// var Roles //= require('../models/roles');

var services = {};

services.getAll = function (limit, offset) {
  return Services.fetchAll({});
};

services.getServices = function (query) {
  query = query || {};
  var queryObject = {
    service_skill_id: query.skill,
    service_resource_id: query.resource
  };

  return Services.where(_.pickBy(queryObject, _.identity)).fetchAll({
    withRelated: ['resource', 'skill']
  });
  // .limit(query.limit || 10)
  // .skip(query.offset || 0)
  // .populate('instructor skill')
};

services.getPopularServices = function (query) {
  return bookshelf.knex.raw('\n    select services.*, cd.*, cd.id as calendar_id\n    from services\n    inner join calendars cd\n    on services.id = cd.calendar_service_id\n  ');
};

services.getById = function (id) {
  return Services.where('id', id).fetch({
    // withRelated: ['resource', 'skill'],
  });
};

// TODO
services.add = function (data, trx) {
  trx = trx ? { transacting: trx } : {};
  try {
    var addObj = {
      service_description: data.service_description,
      service_name: data.service_name || 'todo',
      active: data.active,
      image: data.image,
      service_capacity: data.service_capacity,
      service_duration: data.service_duration,
      service_price: data.service_price,
      service_resource_id: data.service_resource_id,
      service_skill_id: data.service_skill_id,
      service_type: 'todo'
    };

    return new Services(addObj).save(null, trx);
  } catch (err) {
    console.log('error', err);
  }
};

services.updateById = function (id, params) {
  var updatedObj = {};

  if (params.service_description) {
    updatedObj.service_description = params.service_description;
  }

  if (params.service_type) {
    updatedObj.service_type = params.service_type;
  }

  if (params.service_name) {
    updatedObj.service_name = params.service_name;
  }

  if (params.active) {
    updatedObj.active = params.active;
  }

  if (params.image) {
    updatedObj.image = params.image;
  }

  if (params.service_capacity) {
    updatedObj.service_capacity = params.service_capacity;
  }

  if (params.service_duration) {
    updatedObj.service_duration = params.service_duration;
  }

  if (params.service_price) {
    updatedObj.service_price = params.service_price;
  }

  return bookshelf.knex('services').where('id', '=', id).update(updatedObj);
};

services.addService = function (user, s, resourceId) {
  var _formatServiceAndReso = formatServiceAndResource(user, s);

  var service = _formatServiceAndReso.service;

  return new BluebirdPromise(function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(resolve, reject) {
      var image;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              image = void 0;

              if (!service.image) {
                _context.next = 12;
                break;
              }

              _context.prev = 2;
              _context.next = 5;
              return addPhoto(service.image, service.service_name);

            case 5:
              image = _context.sent;

              image = image[0];
              _context.next = 12;
              break;

            case 9:
              _context.prev = 9;
              _context.t0 = _context['catch'](2);

              reject('');

            case 12:
              bookshelf.knex.transaction(function (trx) {
                bookshelf.knex('roles').transacting(trx).where('role_name', '=', 'resource-admin').returning('id').then(function (role) {
                  role = _.get(role, '[0].id');
                  if (!role) {
                    throw new Error({ error: 'role does not exist' });
                  }
                  return bookshelf.knex('memberships').transacting(trx).where({ membership_role_id: role, membership_user_id: Number(user) }).returning('id').then(function (membership) {
                    if (!membership) {
                      throw new Error('membership does not exist');
                    }
                    membership = _.get(membership, '[0].id');
                    return bookshelf.knex('skills').transacting(trx).where('id', '=', service.service_skill_id).then(function (skill) {
                      service.service_resource_id = Number(resourceId);
                      service.service_skill_id = _.get(skill, '[0].id');
                      service.image = image || _.get(skill, '[0].image');

                      return new Services(service).save(null, { transacting: trx }).then(function (serviceAdded) {
                        serviceAdded = _.get(serviceAdded, 'attributes');

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
                  }).then(trx.commit).catch(function (err) {
                    throw new Error(err);
                    trx.rollback;
                  });
                }).then(function (resp) {
                  resolve({ success: true });
                }).catch(function (err) {
                  reject({ error: err });
                });
              });

            case 13:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this, [[2, 9]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
};

function addPhoto(photo, name) {
  var photos = [photo];
  var promises = _.map(photos, function (photo) {
    name = name.replace(/ /g, '_') + '-' + Date.now();
    return cloudinary(photo, name);
  });

  return BluebirdPromise.all(promises).then(function (photos) {
    return _.map(photos, function (img) {
      return img;
    });
  });
}

module.exports = services;