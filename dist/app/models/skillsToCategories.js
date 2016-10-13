'use strict';

module.exports = function (db) {

  var SkillsToCategories = db.Model.extend({
    tableName: 'skillsToCategories',
    skill: function skill() {
      return this.belongsTo('skills', 'skill');
    },
    category: function category() {
      return this.belongsTo('skillCategories', 'skill_category');
    }
  });

  return db.model('skillsToCategories', SkillsToCategories);
};