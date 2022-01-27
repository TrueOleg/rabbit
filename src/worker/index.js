
import amqp from 'amqplib'
import { resolve } from 'bluebird'
import config from '../config'
import fs from 'fs';

const assertQueueOptions = { durable: true }
const consumeQueueOptions = { noAck: false }
const { uri, workQueue, workQueue1 } = config

const genRamdomTime = () => Math.random() * 10000

// const processHeavyTask = msg => resolve(console.log('Message received'))
//   .then(setTimeout(() => console.log(msg.content.toString()), genRamdomTime()))

const processHeavyTask = msg => resolve(console.log('Message received'))
  .then(() => {
    fs.readFileSync('./2.mp4', { encoding: 'utf8', flag: 'r' });
    console.log(msg.content.toString());
  });

const processHeavyTask1 = msg => resolve(console.log('Message received1'))
  .then(() => {
    fs.readFileSync('./2.mp4', { encoding: 'utf8', flag: 'r' });
    console.log(msg.content.toString());
  });

const assertAndConsumeQueue = (channel) => {
  console.log('Worker is running! Waiting for new messages...');

  const ackMsg = (msg) => resolve(msg)
    .tap(msg => processHeavyTask(msg))
    .then((msg) => channel.ack(msg))

  return channel.assertQueue(workQueue, assertQueueOptions)
    .then(() => channel.prefetch(1))
    .then(() => channel.consume(workQueue, ackMsg, consumeQueueOptions))
}

const listenToQueue = () => amqp.connect(uri)
  .then(connection => connection.createChannel())
  .then(channel => assertAndConsumeQueue(channel))


// listenToQueue()
  // eslint-disable-next-line no-unexpected-multiline
  (async () => {

    const connection = await amqp.connect(uri);
    const channelMain = await connection.createChannel();
    const ackMsg = (msg) => resolve(msg)
      .tap(msg => processHeavyTask(msg))
      .then((msg) => channelMain.ack(msg));
    const ackMsg1 = (msg) => resolve(msg)
      .tap(msg => processHeavyTask1(msg))
      .then((msg) => channelMain.ack(msg));
    channelMain.basicQos(1); // Per consumer limit
    channelMain.basicConsume('my-queue1', ackMsg, consumeQueueOptions);
    channelMain.basicConsume('my-queue2', ackMsg1, consumeQueueOptions);
  })();
