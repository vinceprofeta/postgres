'use strict';

var BluebirdPromise = require('bluebird');
var uuid = require('node-uuid');
var _ = require('lodash');

var bookshelf = require('../../db/bookshelf');
var Users = bookshelf.model('users');
var Memberships = bookshelf.model('memberships');
var PaymentMethods = bookshelf.model('paymentMethods');

var users = {};

users.getAll = function (limit, offset) {
  return Users.fetchAll({});
  // .limit(limit || 10)
  // .skip(offset || 0)
};

users.getUsers = function (query) {
  return Users.fetchAll({});
  // .limit(limit || 10)
  // .skip(offset || 0)
};

users.getById = function (id) {
  return Users.where('id', id).fetch({});
};

users.updateById = function (id, params) {
  var updatedObj = {};
  if (params.first_name) {
    updatedObj.first_name = params.first_name;
  }

  if (params.last_name) {
    updatedObj.last_name = params.last_name;
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

  if (params.delete_date) {
    updatedObj.delete_date = params.delete_date;
  }

  if (params.facebook_credentials) {
    updatedObj.facebook_credentials = params.facebook_credentials;
  }

  if (params.stripe_customer_id) {
    updatedObj.stripe_customer_id = params.stripe_customer_id;
  }

  return bookshelf.knex('users').where('id', '=', id).update(updatedObj);
};

users.add = function (params) {
  var user = {
    first_name: params.first_name,
    last_name: params.last_name,
    email: params.email,
    password: params.password,
    facebook_user_id: params.facebook_user_id || null,
    facebook_credentials: params.facebook_credentials || {}
  };
  return new Users(user).save();
};

users.addUserWithMembership = function (params) {
  var user = {
    first_name: params.first,
    last_name: params.last,
    email: params.email,
    password: params.password
  };

  return new BluebirdPromise(function (resolve, reject) {
    bookshelf.knex.transaction(function (trx) {
      bookshelf.knex('users').transacting(trx).insert(user).returning('id').then(function (ids) {
        var user = ids[0];
        return users.addMembership(_.merge(params, { user: user }));
      }).then(trx.commit).catch(trx.rollback);
    }).then(function (resp) {
      resolve({ success: true });
    }).catch(function (err) {
      reject({ error: err });
    });
  });
};

users.addMembership = function (params) {
  // check for valid role and add membership
  return bookshelf.knex('roles').where('role_name', '=', params.role).returning('id').then(function (role) {
    role = _.get(role, '[0].id');
    if (!role) {
      throw new Error({ error: 'role does not exist' });
    }
    return bookshelf.knex('memberships').insert({
      membership_role_id: role,
      status: params.service ? 'pending_approval' : 'approved',
      membership_resource_id: Number(params.resource),
      membership_user_id: Number(params.user),
      membership_service_id: params.service ? Number(params.service) : null
    }).returning('*');
  });
};

users.getMemberships = function (id) {
  return Memberships.where('membership_user_id', id).fetchAll({
    // withRelated: [{'conversation.users.user': function(qb) {
    //   // qb.query.whereIn('id', ids);
    //   qb.column('id', 'first_name', 'last_name')
    // }}],
  });
};

users.updateMembership = function (params) {
  var updatedObj = {};
  if (params.status) {
    updatedObj.status = params.status;
  }

  return bookshelf.knex('memberships').where('membership_user_id', params.user).update(updatedObj).returning('*');
};

users.getPaymentMethods = function (id) {
  return PaymentMethods.where('user_id', id).fetchAll({});
};

module.exports = users;