'use strict';

var elastic = require('../elasticSearchIndexes/services-index.js');

module.exports = function (db) {

  var Services = db.Model.extend({
    tableName: 'services',
    hasTimestamps: true,
    initialize: function initialize() {
      this.on('creating', this.validateCreate);
      this.on('saving', this.validateSave);
      this.on('saved', this.moveToElasticSearch);
    },
    validateCreate: function validateCreate() {},
    validateSave: function validateSave() {},
    resource: function resource() {
      return this.belongsTo('resources', 'service_resource_id');
    },
    skill: function skill() {
      return this.belongsTo('skills', 'service_skill_id');
    },

    moveToElasticSearch: function moveToElasticSearch() {
      _moveToElasticSearch(this.attributes.id, this);
    }
  });

  return db.model('services', Services);

  function _moveToElasticSearch(id, model) {
    // elastic.addService(model);
  }
};