'use strict';

var Services //= require('../models/services');
var Roles //= require('../models/roles');
var Sessions //= require('../models/sessions');

var BluebirdPromise = require('bluebird');
var uuid = require('node-uuid');
var moment = require('moment');
var _ = require('lodash');
var formatServiceAndResource = require('../utils/formatServiceAndResource');

var bookshelf = require('../../db/bookshelf');
var Services = bookshelf.model('services');
var Calendars = bookshelf.model('calendars');
// var Roles //= require('../models/roles');

var services = {};

services.getAll = function(limit, offset) {
  return Services.fetchAll({})
};

services.getServices = function(query) {
  query = query || {}
  var  queryObject = {
    service_skill_id: query.skill,
    service_resource_id: query.resource
  };

  return Services.where(_.pickBy(queryObject, _.identity)).fetchAll({
    withRelated: ['resource', 'skill'],
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


// TODO
services.add = function(data, trx) {
  trx = trx ? {transacting: trx} : {}
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
      service_type: 'todo',
    };

    return new Services(addObj).save(null, trx);
  } catch(err) {
    console.log('error', err)
  }
};


services.updateById = function(id, params) {
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

  return bookshelf.knex('services')
  .where('id', '=', id)
  .update(updatedObj)
};



services.addService = function(user, s, resourceId) {
  const {service} = formatServiceAndResource(user, s);
  return new BluebirdPromise(function(resolve, reject) {
    bookshelf.knex.transaction(function(trx) {
      return bookshelf.knex('roles').transacting(trx).where('role_name', '=', 'resource-admin').returning('id').then(function(role) {
        role = _.get(role, '[0].id');
        if (!role) { throw new Error({error: 'role does not exist'})}
        return bookshelf.knex('memberships').transacting(trx).where({membership_role_id: role, membership_user_id: Number(user)}).returning('id').then(function(membership) {
          if (!membership) { throw new Error({error: 'membership does not exist'})}
          membership = _.get(membership, '[0].id');
          return bookshelf.knex('skills').transacting(trx).where('id', '=', service.service_skill_id).then(function(skill) {
            service.service_resource_id = Number(resourceId);
            service.service_skill_id = _.get(skill, '[0].id');
            service.image = service.image || _.get(skill, '[0].image');

            return new Services(service).save(null, {transacting: trx}).then(function(serviceAdded) { 
              serviceAdded = _.get(serviceAdded, 'attributes');

              var calendar = {
                calendar_agent_id: Number(user), 
                calendar_service_id: Number(serviceAdded.id), 
                // calendar_resource_id: Number(resourceAdded),
                point: service.point || resource.point,
                calendar_capacity: service.capacity, //REMOVEABLE
                calendar_price: service.price // REMOVEABLE
              } 
              return new Calendars(calendar).save(null, {transacting: trx});
            });

          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
      })
      .then(function(resp) {
        resolve({success: true})
      })
      .catch(function(err) {
        // console.log(err)
        reject({error: err})
      });
    }); 
  });
}






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
