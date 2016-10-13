'use strict';

module.exports = function (db) {

  var Memberships = db.Model.extend({
    tableName: 'memberships',
    hasTimestamps: true,
    resource: function resource() {
      return this.belongsTo('resources', 'membership_resource_id');
    },
    service: function service() {
      return this.belongsTo('services', 'membership_service_id');
    },
    role: function role() {
      return this.belongsTo('roles', 'membership_role_id');
    },
    user: function user() {
      return this.belongsTo('users', 'membership_user_id');
    }
  });

  return db.model('memberships', Memberships);
};