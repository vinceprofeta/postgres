'use strict';

module.exports = function(db) {
  
  var Favorites = db.Model.extend({
    tableName: 'favorites',
    hasTimestamps: true,
    user: function() {
      return this.hasOne('users', 'id');
    },
    service: function() {
      return this.hasOne('services', 'id');
    }
  });

  return db.model('favorites', Favorites)

}