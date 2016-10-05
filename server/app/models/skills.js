'use strict';
module.exports = function(db) {

  var Skills = db.Model.extend({
    tableName: 'skills',
    hasTimestamps: true
  });

  return db.model('skills', Skills)

}