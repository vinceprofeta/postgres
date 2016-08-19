'use strict';
var elastic = require('../elasticSearchIndexes/services-index.js');

module.exports = function(db) {
  
  var Services = db.Model.extend({
    tableName: 'services',
    hasTimestamps: true,
    initialize: function() {
      this.on('creating', this.validateCreate);
      this.on('saving', this.validateSave);
      this.on('saved', this.moveToElasticSearch);

    },
    validateCreate: function() {
    },
    validateSave: function() {
    },
    resource: function() {
      return this.belongsTo('resources', 'service_resource_id');
    },
    skill: function() {
      return this.belongsTo('skills', 'service_skill_id');
    },

    moveToElasticSearch: function() {
      moveToElasticSearch(this.attributes.id, this)
    }
  });

  return db.model('services', Services)


  function moveToElasticSearch(id, model) {
    elastic.addService(model);
  }

}