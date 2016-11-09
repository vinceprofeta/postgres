'use strict';
var elastic = require('../elasticSearchIndexes/services-index.js');

module.exports = function(db) {
  
  var Calendars = db.Model.extend({
    tableName: 'calendars',
    hasTimestamps: true,
    initialize: function() {
      this.on('creating', this.validateCreate);
      this.on('saving', this.validateSave);
      this.on('saved', this.moveToElasticSearch);
    },
    // resource: function() {
    //   return this.belongsTo('resources', 'calendar_resource_id');
    // },
    service: function() {
      return this.belongsTo('services', 'calendar_service_id');
    },
    agent: function() {
      return this.belongsTo('users', 'calendar_agent_id');
    },
    moveToElasticSearch: function() {
      moveToElasticSearch(this.attributes.id, this)
    }
  });

  return db.model('calendars', Calendars)

  function moveToElasticSearch(id, model) {
    // elastic.addService(model);
  }

}