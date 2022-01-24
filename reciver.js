#!/usr/bin/env node

import ioClient from 'socket.io-client';
import amqp from 'amqplib'
import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';
import config from './src/config.js'

const { uri, workQueue, workQueue1 } = config
const jobsSocket1 = ioClient.connect('http://localhost:6001');
const jobsSocket2 = ioClient.connect('http://localhost:6002');
const app = express();



const socketServer = http.Server(app);

const IO = new SocketIO(socketServer);

const ports = [jobsSocket1, jobsSocket2];
const queues = [workQueue, workQueue1];
const exchange = 'topic_logs';

// amqp.connect('amqp://localhost', function(error0, connection) {
//   if (error0) {
//     throw error0;
//   }
//   // connection.createChannel(function(error1, channel) {
//   //   if (error1) {
//   //     throw error1;
//   //   }
//   //   var exchange = 'topic_logs';
//   //
//   //   channel.assertExchange(exchange, 'topic', {
//   //     durable: false
//   //   });
//   //
//   //   channel.assertQueue('w1', {
//   //     exclusive: true
//   //   }, function(error2, q) {
//   //     if (error2) {
//   //       throw error2;
//   //     }
//   //     console.log(' [*] Waiting for logs. To exit press CTRL+C');
//   //
//   //     channel.bindQueue(q.queue, exchange, args[0]);
//   //
//   //
//   //     channel.consume(q.queue, function(msg) {
//   //       console.log(" [x] %s:'%s'", q.queue, msg.fields.routingKey, msg.content.toString());
//   //     }, {
//   //       noAck: true
//   //     });
//   //   });
//   // });
//   //
//   // connection.createChannel(function(error1, channel) {
//   //   if (error1) {
//   //     throw error1;
//   //   }
//   //   var exchange = 'topic_logs';
//   //
//   //   channel.assertExchange(exchange, 'topic', {
//   //     durable: false
//   //   });
//   //
//   //   channel.assertQueue('w2', {
//   //     exclusive: true
//   //   }, function(error2, q) {
//   //     if (error2) {
//   //       throw error2;
//   //     }
//   //     console.log(' [*] Waiting for logs. To exit press CTRL+C');
//   //
//   //     channel.bindQueue(q.queue, exchange, args[1]);
//   //
//   //
//   //     channel.consume(q.queue, function(msg) {
//   //       console.log(" [x] %s:'%s'", q.queue, msg.fields.routingKey, msg.content.toString());
//   //     }, {
//   //       noAck: true
//   //     });
//   //   });
//   // });
//
//
// });
const startServer = () => {
  socketServer.listen(6000, async (err) => {
    if (err) {
      console.log(`Error : ${err}`);
      process.exit(-1);
    }

    console.log(`tes is running on 6000`);
    const conn = await amqp.connect('amqp://localhost');
    // eslint-disable-next-line no-restricted-syntax
    for (const [index, value] of queues.entries()) {
      // eslint-disable-next-line no-await-in-loop
      const ch = await conn.createChannel();
      console.log('value', value);
      ch.assertExchange(exchange, 'topic', {
        durable: false
      });
      console.log('exchange', exchange);
      ch.assertQueue(value, {
        exclusive: false
      })
        .then(res => {
          console.log(' [*] Waiting for logs. To exit press CTRL+C', res);
          ch.bindQueue(res.queue, exchange, value);
          return ch.consume(value, function (msg) {
            if (msg !== null) {
              console.log(msg.content.toString());
              const myPromise = new Promise((resolve, reject) => {
                console.log('value', value);
                IO.emit(value, { message: value })
                ports[index].on('job-response', (data) => {
                  console.log('data', data);
                  resolve('ssss')
                })
              })
              myPromise.then(res => {
                ch.ack(msg);
              });
            }
          })
            .catch(err => {
              console.log('err', err);
            })
          // ch.assertQueue(value)
          //   .then(function (ok) {
          //     ch.bindQueue(value, exchange, value);
          //     return ch.consume(value, function (msg) {
          //       if (msg !== null) {
          //         console.log(msg.content.toString());
          //         const myPromise = new Promise((resolve, reject) => {
          //           console.log('value', value);
          //           IO.emit(value, { message: value })
          //           ports[index].on('job-response', (data) => {
          //             console.log('data', data);
          //             resolve('ssss')
          //           })
          //         })
          //         myPromise.then(res => {
          //           ch.ack(msg);
          //         });
          //       }
          //     });
          //   });
        });
    }
  });
};

startServer()
