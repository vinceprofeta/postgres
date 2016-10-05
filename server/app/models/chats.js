'use strict';
module.exports = function(db) {

  var Chats = db.Model.extend({
    tableName: 'chats',
    hasTimestamps: true,
    usersConversations: function() {
      return this.belongsTo('usersConversations');
    },
    user: function() {
      return this.hasOne('users', 'id');
    }
  });

  return db.model('chats', Chats)

}