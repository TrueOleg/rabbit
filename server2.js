import ioClient from 'socket.io-client';
import amqp from 'amqplib'
import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';
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
    jobsSocket1.on('61f2425768f2cb7edc00cb64', (data) => {
      console.log('data', data);
      fs.readFileSync('./1.png', { encoding: 'utf8', flag: 'r' });
      console.log('sssss');
      IO.emit('job-response', {message: `${data.message}'s task complete`})
    })
  });
};

startServer()
