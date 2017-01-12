'use strict';

module.exports = function (db) {

  var SkillsToCategories = db.Model.extend({
    tableName: 'skillsToCategories',
    initialize: function initialize() {
      this.on('saved', this.moveToElasticSearch);
      this.on('updated', this.moveToElasticSearch);
      this.on('destroyed', this.removeFromElasticSearch);
    },
    skill: function skill() {
      return this.belongsTo('skills', 'skill');
    },
    category: function category() {
      return this.belongsTo('skillCategories', 'skill_category');
    },
    moveToElasticSearch: function moveToElasticSearch() {
      _moveToElasticSearch(this.attributes.id, this);
    },
    removeFromElasticSearch: function removeFromElasticSearch() {
      _removeFromElasticSearch(this.attributes.id, this);
    }
  });

  return db.model('skillsToCategories', SkillsToCategories);

  // Help Function
  function _moveToElasticSearch(id, model) {
    worker.addMessage(null, JSON.stringify({
      route: 'skill',
      id: id
    }));
  }

  function _removeFromElasticSearch(id, model) {
    worker.addMessage(null, JSON.stringify({
      route: 'skill',
      action: 'delete',
      id: id
    }));
  }
};