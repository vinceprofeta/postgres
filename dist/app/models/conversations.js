'use strict';

module.exports = function (db) {

  var Conversations = db.Model.extend({
    tableName: 'conversations',
    hasTimestamps: true,
    users: function users() {
      return this.hasMany('usersConversations');
    },
    chats: function chats() {
      return this.hasMany('chats', 'chat_conversation_id');
    },
    last_message: function last_message() {
      return this.belongsTo('chats', 'last_message');
    }
  });

  return db.model('conversations', Conversations);
};