'use strict';

var bcrypt = require('bcrypt-nodejs');
var BluebirdPromise = require('bluebird');

module.exports = function (db) {
  var Users = db.Model.extend({
    tableName: 'users',
    // hidden: ['password'],
    initialize: function initialize() {
      this.on('creating', this.hashPassword, this);
    },
    verifyPassword: function verifyPassword(password, user) {
      return new BluebirdPromise(function (resolve, reject) {
        console.log(password, user.attributes.password);
        bcrypt.compare(password, user.attributes.password, function (err, isMatch) {
          if (err) {
            reject(err);
          } else {
            resolve(!!isMatch);
          }
        });
      });
    },
    hashPassword: function hashPassword(user) {
      return new BluebirdPromise(function (resolve, reject) {
        bcrypt.genSalt(5, function (err, salt) {
          if (err) reject(err);
          bcrypt.hash(user.attributes.password, salt, null, function (err, hash) {
            if (err) return callback(err);
            user.set('password', hash);
            resolve(hash);
          });
        });
      });
    },
    memberships: function memberships() {
      return this.hasMany('memberships', 'membership_user_id');
    }
  });

  return db.model('users', Users);
};