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
        socket.room = join.conversation;
        socket.join(join.conversation);      
        // echo to room 1 that a person has connected to their room
        io.to(join.conversation).emit('updatechat', 'SERVER', join.name + ' has connected to this room');
      });

      socket.on('message', function(message){
        console.log()
        chats.add({ 
          conversation: message.conversation,
          log: message.log,
          user: message.user
        }).then(function(chat) {
          io.to(message.conversation).emit('message', message);
          conversations.updateById(message.conversation, {last_message: chat[0]})
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


