#!/usr/bin/env node
'use strict';

var amqp = require('amqplib/callback_api');
var offlinePubQueue = [];
var worker_queue = 'worker_queue';
var channel;
var amqpConn;
var worker = {};

start();
function start() {
  amqp.connect(process.env.CLOUDAMQP_URL || 'amqp://localhost', function (err, conn) {
    if (err) {
      console.error("[AMQP]", err.message);
      return setTimeout(start, 1000);
    }

    conn.on("error", function (err) {
      if (err.message !== "Connection closing") {
        console.error("[AMQP] conn error", err.message);
      }
    });

    conn.on("close", function () {
      console.error("[AMQP] reconnecting");
      return setTimeout(start, 1000);
    });

    console.log("[AMQP] connected");
    amqpConn = conn;
    whenConnected();
  });
}

function whenConnected() {
  startPublisher();
}

function startPublisher() {
  amqpConn.createConfirmChannel(function (err, ch) {
    if (closeOnErr(err)) return;
    ch.on("error", function (err) {
      console.error("[AMQP] channel error", err.message);
    });
    ch.on("close", function () {
      console.log("[AMQP] channel closed");
    });

    channel = ch;
    channel.assertQueue(worker_queue, { durable: true });

    while (true) {
      var m = offlinePubQueue.shift();
      if (!m) break;
      publish(m[0], m[1], m[2]);
    }
  });
}

function closeOnErr(err) {
  if (!err) return false;
  console.error("[AMQP] error", err);
  amqpConn.close();
  return true;
}

function publish(routingKey, content, delay) {
  try {
    channel.sendToQueue(routingKey, new Buffer(content), { persistent: true });
  } catch (e) {
    console.error("[AMQP] failed", e.message);
    offlinePubQueue.push([routingKey, content, delay]);
  }
}

worker.addMessage = function (routingkey, msg) {
  publish(worker_queue, msg);
};

module.exports = worker;

// #!/usr/bin/env node

// var amqp = require('amqplib/callback_api');
// var q = 'task_queue';
// var channel;
// var service = {}

// amqp.connect('amqp://localhost', function(err, conn) {
//   conn.createChannel(function(err, ch) {
//     ch.assertQueue(worker_queue, {durable: true});

//     channel = ch;
//   });
// });

// service.addMessage = function(msg) {
//   channel.sendToQueue(worker_queue, new Buffer(msg), {persistent: true});
// }

// module.exports = service;