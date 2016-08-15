'use strict';

module.exports = function(db) {
  var Users = db.Model.extend({
    tableName: 'users',
    // hidden: ['password'],
    verifyPassword: function(password) {
      return this.get('password') === password;
    },
    memberships: function() {
      return this.hasMany('memberships', 'membership_user_id');
    }
  });


  return db.model('users', Users)
}