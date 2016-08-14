'use strict';

module.exports = function(db) {
  
  var Services = db.Model.extend({
    tableName: 'services',
    hasTimestamps: true,
    resource: function() {
      return this.hasOne('resources', 'id');
    },
    skill: function() {
      return this.hasOne('skills', 'id');
    }
  });

  return db.model('services', Services)

}