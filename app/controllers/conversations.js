'use strict';

var Conversations// = require('../models/conversations');
var Roles// = require('../models/roles');
var BluebirdPromise = require('bluebird');
var uuid = require('node-uuid');
var _ = require('lodash');

var bookshelf = require('../../db/bookshelf');
var Conversations = bookshelf.model('conversations');

var rooms = {};

rooms.getAll = function(limit, offset) {
  return Conversations.fetchAll({
    withRelated: ['chats.user'],
  })
  //   .limit(limit || 10)
  //   .skip(offset || 0)
  //   .populate('lastMessage')
};

rooms.getById = function(id) {
  return Conversations.where('id', id).fetch({
    withRelated: ['chats.user'],
  })
  // return Conversations.findOne({
  //   _id: id
  // })
  // .populate('lastMessage')
  // .exec(function(err, user) {
  //   return user;
  // });
};

rooms.getByUsersInConversation = function(ids) {
  return new BluebirdPromise(function(resolve, reject) {
    ids = JSON.parse(ids);
    Conversations.where('id', id).fetch({
      withRelated: [{'chats.user': function(qb) {
        qb.query.whereIn('id', ids);
      }}],
    })
    .then(function(conversation) {
      if (!conversation) {
        // return rooms.add({
        //   userOne: ids[0],
        //   userTwo: ids[1]
        // })
      }
      else {
        resolve(conversation)
      }
    })
    .then(function(conversation) {
      resolve(conversation)
    })
    .catch(function(err) {
      reject(err)
    })
  })
};

rooms.getConversationsForUser = function(id) {
 
 // return Conversations.find({
 //    users: {$in: [id]}
 //  }).populate('lastMessage users')
};

rooms.updateById = function(id, params) {
  
  // var updatedObj = {};
  // var find = {_id: id};
  // updatedObj.lastMessage = params.lastMessage;
  // return Conversations.update(find, updatedObj)
  //   .exec(function(err, updatedObj) {
  //     if(err) {
  //       throw err; 
  //     }else{
  //       return updatedObj;
  //     }
  //   });
};

rooms.add = function(params) {
  
  // var conversation = new Conversations({ 
  //   users: [params.userOne, params.userTwo],
  //   roomId: params.roomId
  // });

  // return conversation.save()
};



module.exports = rooms;
