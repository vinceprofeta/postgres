'use strict';

module.exports = function(db) {
  
  var Conversations = db.Model.extend({
    tableName: 'conversations',
    hasTimestamps: true,
    users: function() {
      return this.hasMany('usersConversations');
    },
    chats: function() {
      return this.hasMany('chats', 'chat_conversation_id');
    },
    last_message: function() {
      return this.belongsTo('chats', 'last_message');
    },
  });

  return db.model('conversations', Conversations)

}