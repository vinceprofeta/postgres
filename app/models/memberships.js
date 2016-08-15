'use strict';

module.exports = function(db) {
  
  var Memberships = db.Model.extend({
    tableName: 'memberships',
    hasTimestamps: true,
    resource: function() {
      return this.belongsTo('resources', 'membership_resource_id');
    },
    service: function() {
      return this.belongsTo('services', 'membership_service_id');
    },
    role: function() {
      return this.belongsTo('roles', 'membership_role_id');
    },
    user: function() {
      return this.belongsTo('users', 'membership_user_id');
    }
  });

  return db.model('memberships', Memberships)

}