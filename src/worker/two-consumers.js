import ioClient from 'socket.io-client';
import amqp from 'amqplib'
import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';
import config from '../config'


const jobsSocket = ioClient.connect('http://localhost:3000');
const app = express();



const socketServer = http.Server(app);

const IO = new SocketIO(socketServer);
const startServer = () => {
  socketServer.listen(6000, err => {
    if (err) {
      console.log(`Error : ${err}`);
      process.exit(-1);
    }

    console.log(`tes is running on 6000`);
    const assertQueueOptions = { durable: true }
    const consumeQueueOptions = { noAck: false }
    const { uri, workQueue, workQueue1 } = config
    const open = amqp.connect('amqp://localhost');

    [workQueue, workQueue1].forEach(oueue => {
      open.then(function(conn) {
        return conn.createChannel();
      }).then(function(ch) {
        ch.prefetch(1);
        return ch.assertQueue(oueue).then(function(ok) {
          return ch.consume(oueue, function(msg) {
            if (msg !== null) {
              console.log(msg.content.toString());
              const myPromise = new Promise((resolve, reject) => {
                IO.emit('job', {message: 'ssssssss'})
                jobsSocket.on('job-response', (data) => {
                  resolve('ssss')
                })
              }).then(res => {
                ch.ack(msg);
              });
            }
          });
        });
      }).catch(console.warn);
    })
  });
};

startServer()
