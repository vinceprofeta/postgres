'use strict';

module.exports = function(db) {
  
  var Memberships = db.Model.extend({
    tableName: 'memberships',
    hasTimestamps: true,
    resource: function() {
      return this.hasOne('resources', 'id');
    },
    service: function() {
      return this.hasOne('services', 'id');
    },
    role: function() {
      return this.hasOne('role', 'id');
    }
  });

  return db.model('memberships', Memberships)

}