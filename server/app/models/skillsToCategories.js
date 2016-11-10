'use strict';
module.exports = function(db) {

  var SkillsToCategories = db.Model.extend({
    tableName: 'skillsToCategories',
    initialize: function() {
      this.on('saved', this.moveToElasticSearch);
      this.on('updated', this.moveToElasticSearch);
      this.on('destroyed', this.removeFromElasticSearch);
    },
    skill: function() {
      return this.belongsTo('skills', 'skill');
    },
    category: function() {
      return this.belongsTo('skillCategories', 'skill_category');
    },
    moveToElasticSearch: function() {
      moveToElasticSearch(this.attributes.id, this)
    },
    removeFromElasticSearch: function() {
      removeFromElasticSearch(this.attributes.id, this)
    }
  });

  return db.model('skillsToCategories', SkillsToCategories)

   // Help Function
  function moveToElasticSearch(id, model) {
    worker.addMessage(null, JSON.stringify({
      route: 'skill', 
      id: id
    }))
  }

  function removeFromElasticSearch(id, model) {
    worker.addMessage(null, JSON.stringify({
      route: 'skill',
      action: 'delete',
      id: id
    }))
  }

  
}