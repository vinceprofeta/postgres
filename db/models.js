// var bookshelf = require('./bookshelf');
// var mm = {}

// mm.Conversations = bookshelf.Model.extend({
//   tableName: 'conversations',
//   hasTimestamps: true,
//   users: function() {
//     return this.hasMany(mm.usersConversations);
//   },
//   chats: function() {
//     return this.hasMany(mm.Chats, 'chat_conversation_id');
//   }
// });


// mm.usersConversations = bookshelf.Model.extend({
//   tableName: 'usersConversations',
//   hasTimestamps: true,
//   conversationId: function() {
//     return this.belongsTo(mm.Conversations);
//   },
//   user: function() {
//     return this.hasOne(mm.Users);
//   }
// });

// mm.Chats = bookshelf.Model.extend({
//   tableName: 'chats',
//   hasTimestamps: true,
//   usersConversations: function() {
//     return this.belongsTo(mm.usersConversations);
//   },
//   user: function() {
//     return this.hasOne(mm.Users, 'id');
//   }
// });


// mm.Users = bookshelf.Model.extend({
//   tableName: 'users',
//   hidden: ['password'],
//   verifyPassword: function(password) {
//     return this.get('password') === password;
//   }
// });

// module.exports = mm;