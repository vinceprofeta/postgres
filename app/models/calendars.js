'use strict';

module.exports = function(db) {
  
  var Calendars = db.Model.extend({
    tableName: 'calendars',
    hasTimestamps: true,
    resource: function() {
      return this.hasOne('resources', 'id');
    },
    service: function() {
      return this.hasOne('services', 'id');
    },
    agent: function() {
      return this.hasOne('users', 'id');
    }
  });

  return db.model('calendars', Calendars)

}