'use strict';

module.exports = function(db) {
  
  var Services = db.Model.extend({
    tableName: 'services',
    hasTimestamps: true,
    resource: function() {
      return this.hasOne('resources', 'id');
    }
  });

  return db.model('services', Services)

}