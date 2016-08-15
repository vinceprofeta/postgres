'use strict';

module.exports = function(db) {
  var Roles = db.Model.extend({
    tableName: 'roles'
  });

  return db.model('roles', Roles)
}