var _ = require('lodash');
var chats = require('../controllers/chats');
var conversations = require('../controllers/conversations');
var rooms = []
var io;
var ioListeners = {
  
  start: function(server) {

    io = require('socket.io')(server);
    io.on('connection', function(socket){
      console.log(socket.handshake.query)
      // socket.set('nickname', name)
      console.log('a user connected');
      io.emit('hi', { for: 'everyone' });

      socket.on('joinRoom', function(join){
        socket.username = join.name;
        socket.room = join.converssation;
        socket.join(join.conversation);      
        // echo to room 1 that a person has connected to their room
        console.log(join.conversation, 'join convo')
        io.to(join.conversation).emit('updatechat', 'SERVER', join.name + ' has connected to this room');
      });

      socket.on('message', function(message){
        console.log( message.conversation)
        chats.add({ 
          conversation: message.conversation,
          log: message.log,
          user: message.user
        }).then(async function(chat) {
           chat[0].user = {
            id: _.get(message, 'user'),
            facebook_user_id: _.get(message, 'facebook_user_id'),
            first_name: _.get(message, 'first_name'),
            last_name: _.get(message, 'last_name')
          }
          io.to(message.conversation).emit('message', chat[0]);
          const aa = await conversations.updateById(message.conversation, {last_message: chat[0].chat_conversation_id})
        })
      });


    });
  },

  joinRoom: function(server) {
    io.on('connection', function(socket){
      io.join(room);
    });
  }


}


module.exports = ioListeners;


