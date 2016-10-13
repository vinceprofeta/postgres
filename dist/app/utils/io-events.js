'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var _ = require('lodash');
var chats = require('../controllers/chats');
var conversations = require('../controllers/conversations');
var rooms = [];
var io;
var ioListeners = {

  start: function start(server) {

    io = require('socket.io')(server);
    io.on('connection', function (socket) {
      console.log(socket.handshake.query);
      // socket.set('nickname', name)
      console.log('a user connected');
      io.emit('hi', { for: 'everyone' });

      socket.on('joinRoom', function (join) {
        socket.username = join.name;
        socket.room = join.converssation;
        socket.join(join.conversation);
        // echo to room 1 that a person has connected to their room
        console.log(join.conversation, 'join convo');
        io.to(join.conversation).emit('updatechat', 'SERVER', join.name + ' has connected to this room');
      });

      socket.on('message', function (message) {
        console.log(message.conversation);
        chats.add({
          conversation: message.conversation,
          log: message.log,
          user: message.user
        }).then(function () {
          var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(chat) {
            var aa;
            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    chat[0].user = {
                      id: _.get(message, 'user'),
                      facebook_user_id: _.get(message, 'facebook_user_id'),
                      first_name: _.get(message, 'first_name'),
                      last_name: _.get(message, 'last_name')
                    };
                    io.to(message.conversation).emit('message', chat[0]);
                    _context.next = 4;
                    return conversations.updateById(message.conversation, { last_message: chat[0].chat_conversation_id });

                  case 4:
                    aa = _context.sent;

                  case 5:
                  case 'end':
                    return _context.stop();
                }
              }
            }, _callee, this);
          }));

          return function (_x) {
            return _ref.apply(this, arguments);
          };
        }());
      });
    });
  },

  joinRoom: function joinRoom(server) {
    io.on('connection', function (socket) {
      io.join(room);
    });
  }

};

module.exports = ioListeners;