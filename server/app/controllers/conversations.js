'use strict';

var Conversations// = require('../models/conversations');
var Roles// = require('../models/roles');
var BluebirdPromise = require('bluebird');
var uuid = require('node-uuid');
var _ = require('lodash');

var bookshelf = require('../../db/bookshelf');
var Conversations = bookshelf.model('conversations');
var UsersConversations = bookshelf.model('usersConversations');
// var Chats = bookshelf.model('chats');

var rooms = {};

rooms.getAll = function(limit, offset) {
  return Conversations.fetchAll({
    withRelated: ['chats.user', 'users.user'],
  })
  //   .limit(limit || 10)
  //   .skip(offset || 0)
  //   .populate('lastMessage')
};

rooms.getById = function(id) {
  return Conversations.where('id', id).fetch({
    withRelated: ['chats.user', 'users.user'],
  })
  // lastMessage
};



// Add Comment Collaps


rooms.getByUsersInConversation = function(userIds) {
  return new BluebirdPromise(function(resolve, reject) {
    var ids; 
    try {
      ids = JSON.parse(userIds);
      if (ids.length < 2) {
        reject('invalid post')
      }
    } catch(err) {
      reject('invalid post')
    }
   
    bookshelf.knex('usersConversations').select('conversation_id')
    .whereIn('conversation_user_id', ids)
    .groupBy('conversation_id').havingRaw('count(*) = ?', [ids.length])
    .then(function(conversation) {
      if (!_.get(conversation, 'length')) {
        return rooms.add({
          userOne: ids[0],
          userTwo: ids[1]
        })
        .then(function() {
          return bookshelf.knex('usersConversations').select('conversation_id')
          .whereIn('conversation_user_id', ids)
          .groupBy('conversation_id').havingRaw('count(*) = ?', [ids.length])
          .then(function(conversation) {
            resolve(conversation[0])
          })
        })
      }
      else {
        resolve(conversation[0])
      }
    })
    .catch(function(err) {
      reject(err)
    })
  })
};

rooms.getConversationsForUser = function(id) {
  return UsersConversations.where('conversation_user_id', id).fetchAll({
    withRelated: ['conversation.users.user', 'conversation.last_message']
  })
};

rooms.updateById = function(id, params) {
  return bookshelf.knex('conversations')
  .where('id', '=', id)
  .update({
    last_message: params.last_message
  })
};

rooms.add = function(params) {
  return new BluebirdPromise(function(resolve, reject) {
    bookshelf.knex.transaction(function(trx) {
      bookshelf.knex('conversations').transacting(trx).insert({}).returning('id').then(function(ids) {
        var conversation = ids[0]
        var promises = [];
        promises.push(bookshelf.knex('usersConversations').transacting(trx).insert({
          conversation_id: conversation,
          conversation_user_id: Number(params.userOne)
        }).returning('id'));
        promises.push(bookshelf.knex('usersConversations').transacting(trx).insert({
          conversation_id: conversation,
          conversation_user_id: Number(params.userTwo)
        }).returning('id'));
        return BluebirdPromise.all(promises)
      })
      .then(trx.commit)
      .catch(trx.rollback);
    })
    .then(function(resp) {
      resolve({success: true})
    })
    .catch(function(err) {
      reject({error: err})
    });
  }); 
};



module.exports = rooms;



















 // where conversation_id are  ====
    // conversation_user_id === any of ids
    // UsersConversations.query(function(qb) {
    //   qb.whereIn('conversation_user_id', ids)
    //   // qb.groupBy('conversation_id', ids)
    // }).fetchAll({
    //   // withRelated: [{'conversation.users.user': function(qb) {
    //   //   // qb.query.whereIn('id', ids);
    //   //   qb.column('id', 'first_name', 'last_name')
    //   // }}],
    // })
    // bookshelf.knex.raw('SELECT * FROM conversations WHERE id IN (SELECT conversation_id FROM "usersConversations" WHERE conversation_user_id IN (' + ids + ') GROUP BY conversation_id HAVING COUNT(*) = '+ids.length+')')
    // bookshelf.knex.raw('SELECT count(*), conversation_id FROM "usersConversations" WHERE conversation_user_id IN (' + ids + ') GROUP BY conversation_id HAVING COUNT(*) = '+ids.length+'')
    // bookshelf.knex.raw('SELECT conversation_id, count(*) FROM "usersConversations" WHERE conversation_user_id IN (' + ids + ') GROUP BY conversation_id HAVING COUNT(*) = '+ids.length+'')
