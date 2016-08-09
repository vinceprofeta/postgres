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
    }
  });

  return db.model('conversations', Conversations)

}