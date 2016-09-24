'use strict';
module.exports = function(db) {

  var SkillsToCategories = db.Model.extend({
    tableName: 'skillsToCategories',
    skill: function() {
      return this.belongsTo('skills', 'skill');
    },
    category: function() {
      return this.belongsTo('skillCategories', 'skill_category');
    }
  });

  return db.model('skillsToCategories', SkillsToCategories)

}