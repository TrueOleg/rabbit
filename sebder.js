#!/usr/bin/env node

import amqp from 'amqplib';

var exchange = 'topic_logs';
var args = process.argv.slice(2);
var key = (args.length > 0) ? args[0] : 'anonymous.info';
var msg = args.slice(1).join(' ') || 'Hello World!';
console.log('key', key);

(async () => {
  const connection = await amqp.connect('amqp://localhost');
  console.log('sdffsdfsdfsdf');
  const channel = await connection.createChannel()


  channel.assertExchange(exchange, 'topic', {
    durable: false
  });
  channel.publish(exchange, key, Buffer.from(msg));
  console.log(" [x] Sent %s:'%s'", key, msg);

  setTimeout(function() {
    connection.close();
    process.exit(0);
  }, 500);
})();
