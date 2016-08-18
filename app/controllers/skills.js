'use strict';

var Skills// = require('../models/Skills');
var Roles// = require('../models/roles');
var _ = require('lodash');

var bookshelf = require('../../db/bookshelf');
var Skills = bookshelf.model('skills');

var skills = {};

skills.getAll = function(limit, offset) {
  return Skills.fetchAll({})
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
  if (params.deleted) {
    updatedObj.deleted = params.deleted;
  }

  return bookshelf.knex('skills')
  .where('id', '=', id)
  .update(updatedObj)
};

skills.add = function(params) {
  console.log(params)
  var skill = { 
    description: params.description,
    name: params.name,
    rank: params.rank
  };

  return bookshelf.knex('skills').insert(skill).returning('*')
};



module.exports = skills;
