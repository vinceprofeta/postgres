'use strict';

module.exports = function(db) {
  
  var Resources = db.Model.extend({
    tableName: 'resources',
    hasTimestamps: true,
  });

  return db.model('resources', Resources)

}