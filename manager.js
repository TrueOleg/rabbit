import ioClient from 'socket.io-client';
import amqp from 'amqplib'
import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';
import config from './src/config'


const jobsSocket1 = ioClient.connect('http://localhost:6001');
const jobsSocket2 = ioClient.connect('http://localhost:6002');
const app = express();



const socketServer = http.Server(app);

const IO = new SocketIO(socketServer);
const startServer = () => {
  socketServer.listen(6000, async (err) => {
    if (err) {
      console.log(`Error : ${err}`);
      process.exit(-1);
    }

    console.log(`tes is running on 6000`);
    const assertQueueOptions = { durable: true }
    const consumeQueueOptions = { noAck: false }
    const { uri, workQueue, workQueue1 } = config
    const open = amqp.connect('amqp://localhost');
    const ports = [jobsSocket1, jobsSocket2];
    const queues = [workQueue, workQueue1];
    const conn = await open;
    // eslint-disable-next-line no-restricted-syntax
    for (const [index, value] of queues.entries()) {
      // eslint-disable-next-line no-await-in-loop
      const ch = await conn.createChannel();
      ch.assertQueue(value).then(function(ok) {
        return ch.consume(value, function(msg) {
          if (msg !== null) {
            console.log(msg.content.toString());
            const myPromise = new Promise((resolve, reject) => {
              console.log('value', value);
              IO.emit('job', {message: value})
              ports[index].on('job-response', (data) => {
                console.log('data', data);
                resolve('ssss')
              })
            })
            myPromise.then(res => {
              ch.ack(msg);
            });
          }
        });
      });
    }
  });
};

startServer()
