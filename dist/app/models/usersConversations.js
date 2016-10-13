'use strict';

module.exports = function (db) {

  var usersConversations = db.Model.extend({
    tableName: 'usersConversations',
    hasTimestamps: true,
    conversation: function conversation() {
      return this.belongsTo('conversations');
    },
    user: function user() {
      return this.belongsTo('users', 'conversation_user_id');
    }
  });

  return db.model('usersConversations', usersConversations);
};