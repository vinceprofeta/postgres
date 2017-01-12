'use strict';

var worker = require('../contextManagers/workerContext.js');

module.exports = function (db) {

  var Calendars = db.Model.extend({
    tableName: 'calendars',
    hasTimestamps: true,
    initialize: function initialize() {
      this.on('saved', this.moveToElasticSearch);
      this.on('updated', this.moveToElasticSearch);
      this.on('destroyed', this.removeFromElasticSearch);
    },
    // resource: function() {
    //   return this.belongsTo('resources', 'calendar_resource_id');
    // },
    service: function service() {
      return this.belongsTo('services', 'calendar_service_id');
    },
    agent: function agent() {
      return this.belongsTo('users', 'calendar_agent_id');
    },
    moveToElasticSearch: function moveToElasticSearch() {
      _moveToElasticSearch(this.attributes.id, this);
    },
    removeFromElasticSearch: function removeFromElasticSearch() {
      _removeFromElasticSearch(this.attributes.id, this);
    }
  });

  return db.model('calendars', Calendars);

  // Help Function
  function _moveToElasticSearch(id, model) {
    worker.addMessage(null, JSON.stringify({
      route: 'calendar',
      id: id
    }));
  }

  function _removeFromElasticSearch(id, model) {
    worker.addMessage(null, JSON.stringify({
      route: 'calendar',
      action: 'delete',
      id: id
    }));
  }
};