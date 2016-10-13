'use strict';

module.exports = function (db) {

  var SkillCategories = db.Model.extend({
    tableName: 'skillCategories'
  });

  return db.model('skillCategories', SkillCategories);
};