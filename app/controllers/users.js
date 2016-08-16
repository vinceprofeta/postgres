'use strict';
var BluebirdPromise = require('bluebird');
var uuid = require('node-uuid');
var _ = require('lodash');

var bookshelf = require('../../db/bookshelf');
var Users = bookshelf.model('users');
var Memberships = bookshelf.model('memberships');

var users = {};

users.getAll = function(limit, offset) {
  return Users.fetchAll({})
  // .limit(limit || 10)
  // .skip(offset || 0)
};

users.getUsers = function(query) {
  return Users.fetchAll({})
  // .limit(limit || 10)
  // .skip(offset || 0)
};


users.getById = function(id) {
  return Users.where('id', id).fetch({})
};


users.updateById = function(id, params) {
  var updatedObj = {};
  if (params.firstName) {
    updatedObj.firstName = params.firstName;
  }

  if (params.lastName) {
    updatedObj.lastName = params.lastName;
  }

  if (params.email) {
    updatedObj.email = params.email;
  }

  if (params.bio) {
    updatedObj.bio = params.bio;
  }

  if (params.phone) {
    updatedObj.phone = params.phone;
  }

  if (params.password) {
    updatedObj.password = params.password;
  }

  if (params.avatar) {
    updatedObj.avatar = params.avatar;
  }

  if (params.deleted) {
    updatedObj.deleted = params.deleted;
  }

  // if (params.facebookCredentials) {
  //   updatedObj.facebookCredentials = params.facebookCredentials;
  // }

  return bookshelf.knex('users')
  .where('id', '=', id)
  .update(updatedObj)
};


users.add = function(params) {
  var user = { 
    firstName: params.first,
    lastName: params.last,
    email: params.email,
    password: params.password
  };
  return new Users(user).save()
};


users.addUserWithMembership = function(params) {
  var user = { 
    firstName: params.first,
    lastName: params.last,
    email: params.email,
    password: params.password
  };

  return new BluebirdPromise(function(resolve, reject) {
    bookshelf.knex.transaction(function(trx) {
      bookshelf.knex('users').transacting(trx).insert(user).returning('id')
      .then(function(ids) {
        var user = ids[0];
        return users.addMembership(_.merge(params, {user: user}))
      })
      .then(trx.commit)
      .catch(trx.rollback);
    })
    .then(function(resp) {
      resolve({success: true})
    })
    .catch(function(err) {
      reject({error: err})
    });
  }); 
};


users.addUserWithMembershipAndResource = function(params) {
  var user = { 
    firstName: params.first,
    lastName: params.last,
    email: params.email,
    password: params.password
  };

  return new BluebirdPromise(function(resolve, reject) {
    bookshelf.knex.transaction(function(trx) {
      bookshelf.knex('users').transacting(trx).insert(user).returning('id')
      .then(function(ids) {
        var user = ids[0];
        return users.addMembership(_.merge(params, {user: user}))
      })
      .then(trx.commit)
      .catch(trx.rollback);
    })
    .then(function(resp) {
      resolve({success: true})
    })
    .catch(function(err) {
      reject({error: err})
    });
  }); 
};



users.addMembership = function(params) {
  // check for valid role and add membership
  return bookshelf.knex('roles').where('roleName', '=', params.role).returning('id')
  .then(function(role) {
    role = _.get(role, '[0].id');
    if (!role) { throw new Error({error: 'role does not exist'})}
    return bookshelf.knex('memberships').insert({
      membership_role_id: role,
      status: params.service ? 'pending_approval' : 'approved',
      membership_resource_id: Number(params.resource),
      membership_user_id: Number(params.user),
      membership_service_id: params.service ? Number(params.service) :  null
    }).returning('*')
  }) 
};


users.getMemberships = function(id) {
  return Memberships.where('membership_user_id', id).fetchAll({
    // withRelated: [{'conversation.users.user': function(qb) {
    //   // qb.query.whereIn('id', ids);
    //   qb.column('id', 'firstName', 'lastName')
    // }}],
  })

};


users.updateMembership = function(params) {
  var updatedObj = {};
  if (params.status) {
    updatedObj.status = params.status;
  }

  return bookshelf.knex('memberships').where('membership_user_id', params.user).update(updatedObj).returning('*')
};






// users.getBookedInstructorSessions = function(obj) {
//   var startDate = obj.start;
//   var endDate = obj.end;
//   var id = obj.id;
//   var limit = obj.limit;
//   var offset = obj.offset;
//   var showCancelled = obj.showCancelled;

//   return Sessions.find({
//     complete: { $exists: false },
//     removed: { $exists: false },
//     dismissed: {
//       $nin: [id]
//     },
//     $and : [
//       {$or: [ 
//         { cancelled: { $exists: false } }, 
//         {$and: [ 
//           { date: { $gte: startDate } }, 
//           { cancelled: { $exists: !!showCancelled } } // mark as true if you want to see cancelled
//         ]} 
//       ]},
//       {$or: [ 
//         { instructor: id }, 
//         { enrolled: { $in: [id] } } 
//       ]}
//     ],
//     $or: [ 
//       { $where: "this.enrolled.length > 0"}, 
//       { private: { $ne: true } } 
//     ],
//     date: {
//       $lte: endDate
//     }
//   })
//   .populate('instructor')
//   .populate('location')
//   .populate('enrolled')
//   .limit(limit || 100)
//   .skip(offset || 0)
//   .sort({date: 1, "dateAndTime" : 1})
//   .exec(function(err, sessions) {
//     return sessions;
//   });
// };


// users.getSessions = function(obj) {
//   var startDate = obj.start;
//   var endDate = obj.end;
//   var id = obj.id;
//   var limit = obj.limit;
//   var offset = obj.offset;
//   var notComplete = obj.notComplete;
//   var query = {
//     enrolled: {
//       $in: [id]
//     },
//     dismissed: {
//       $nin: [id]
//     },
//     removed: { $exists: false }
//   };

//   if (startDate && endDate) {
//     query.date = {
//       $gte: startDate,
//       $lte: endDate
//     }
//   }

//   if (notComplete) {
//     query.complete = { $exists: false };
//   } 

//   return Sessions.find(query)
//     .populate('listing')
//     .limit(limit || 100)
//     .skip(offset || 0)
//     .sort({"dateAndTime" : 1})
//     .exec(function(err, sessions) {
//       return sessions;
//     });
// };



// users.getPaymentMethod = function(id) {
//   var query = 'paymentMethod name';
//   return Users.findOne({ _id: id }, query)
//     .populate('paymentMethod')
//     .exec(function(err, paymentMethod) {
//       return paymentMethod;
//     });
// };



module.exports = users;
