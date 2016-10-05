'use strict';

var Chats// = require('../models/Chats');
var Roles// = require('../models/roles');
var _ = require('lodash');

var bookshelf = require('../../db/bookshelf');
var Chats = bookshelf.model('chats');

var chats = {};

chats.getAll = function(limit, offset) {
  return Chats.fetchAll({
    withRelated: [{'user': function(qb) {
      qb.column('id', 'first_name', 'last_name')
    }}],
  })
};

chats.getById = function(id) {
  return Chats.where('id', id).fetch({
    withRelated: [{'user': function(qb) {
      qb.column('id', 'first_name', 'last_name')
    }}],
  })
};

chats.getChatsInConversation = function(conversation_id) {
  return Chats.where('chat_conversation_id', conversation_id).fetchAll({
     withRelated: [{'user': function(qb) {
      qb.column('id', 'first_name', 'last_name')
    }}],
  })
};

chats.updateById = function(id, params) {
  var updatedObj = {};
  return bookshelf.knex('chats')
  .where('id', '=', id)
  .update(updatedObj)
};

chats.add = function(params) {
  var chat = { 
    chat_conversation_id: params.conversation,
    log: params.log,
    chat_user_id: params.user
  };

  return bookshelf.knex('chats').insert(chat).returning('*')
};



module.exports = chats;
