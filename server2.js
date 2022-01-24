import ioClient from 'socket.io-client';
import amqp from 'amqplib'
import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';
import config from './src/config'
import fs from 'fs';


const jobsSocket1 = ioClient.connect('http://localhost:6000');
const app = express();



const socketServer = http.Server(app);

const IO = new SocketIO(socketServer);
const startServer = () => {
  socketServer.listen(6002, err => {
    if (err) {
      console.log(`Error : ${err}`);
      process.exit(-1);
    }
    jobsSocket1.on('workQueue1', (data) => {
      console.log('data', data);
      fs.readFileSync('./1.png', { encoding: 'utf8', flag: 'r' });
      IO.emit('job-response', {message: `${data.message}'s task complete`})
    })
  });
};

startServer()
