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
      qb.column('id', 'firstName', 'lastName')
    }}],
  })
};

chats.getById = function(id) {
  return Chats.where('id', id).fetch({
    withRelated: [{'user': function(qb) {
      qb.column('id', 'firstName', 'lastName')
    }}],
  })
};

chats.getChatsInConversation = function(conversationId) {
  return Chats.where('chat_conversation_id', conversationId).fetchAll({
     withRelated: [{'user': function(qb) {
      qb.column('id', 'firstName', 'lastName')
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
    chat_conversation_id: params.chat_conversation_id,
    log: params.log,
    chat_user_id: params.chat_user_id
  };

  return bookshelf.knex('chats').insert(chat).returning('*')
};



module.exports = chats;
