'use strict';

var Skills// = require('../models/Skills');
var Roles// = require('../models/roles');
var _ = require('lodash');

var bookshelf = require('../../db/bookshelf');
var Skills = bookshelf.model('skills');
var SkillCategories = bookshelf.model('skillCategories');
var skillsToCategories = bookshelf.model('skillsToCategories');

var skills = {};

skills.getAll = function(limit, offset) {
  // return skillsToCategories.fetchAll({
  //   withRelated: ["skill", "category"],
  // })

  return bookshelf.knex.raw(`
    select sk.*, sc.name as category
    from "skillsToCategories" stc
    inner join skills sk
    on sk.id = stc.skill
    inner join "skillCategories" sc
    on sc.id = stc.skill_category
  `).then((result) => {
    return result.rows;
  })

  // return Skills.fetchAll({})
};



skills.getPopular = function(id) {
  return Skills.fetchAll({}) //Skills.where('rank', 1).fetchAll({})
};




skills.getById = function(id) {
  return Skills.where('id', id).fetchAll({})
};



skills.updateById = function(id, params) {
  var updatedObj = {};
  if (params.description) {
    updatedObj.description = params.description;
  }
  if (params.name) {
    updatedObj.name = params.name;
  }
  if (params.rank) {
    updatedObj.rank = params.rank;
  }
  if (params.delete_date) {
    updatedObj.delete_date = params.delete_date;
  }

  return bookshelf.knex('skills')
  .where('id', '=', id)
  .update(updatedObj)
};

skills.add = function(params) {
  var skill = { 
    description: params.description,
    name: params.name,
    rank: params.rank
  };

  return bookshelf.knex('skills').insert(skill).returning('*')
};


skills.getAllCategories = function(limit, offset) {
  return SkillCategories.fetchAll({})
};

skills.addCategory = function(params) {
 console.log('TODO')
};



module.exports = skills;
