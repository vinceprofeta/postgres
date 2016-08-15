'use strict';

module.exports = function(db) {
  
  var Services = db.Model.extend({
    tableName: 'services',
    hasTimestamps: true,
    resource: function() {
      return this.belongsTo('resources', 'service_resource_id');
    },
    skill: function() {
      return this.belongsTo('skills', 'service_skill_id');
    }
  });

  return db.model('services', Services)

}