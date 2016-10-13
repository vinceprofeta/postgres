'use strict';

module.exports = function (db) {

  var Calendars = db.Model.extend({
    tableName: 'calendars',
    hasTimestamps: true,
    // resource: function() {
    //   return this.belongsTo('resources', 'calendar_resource_id');
    // },
    service: function service() {
      return this.belongsTo('services', 'calendar_service_id');
    },
    agent: function agent() {
      return this.belongsTo('users', 'calendar_agent_id');
    }
  });

  return db.model('calendars', Calendars);
};