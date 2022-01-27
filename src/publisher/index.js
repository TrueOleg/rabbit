
import amqp from 'amqplib'
import { resolve } from 'bluebird'
import config from '../config'

const assertQueueOptions = { durable: true }
const sendToQueueOptions = { persistent: true }
const data = process.argv[2] ? process.argv[2] : 'any data goes here'
const { uri, workQueue, workQueue1 } = config

const lightTask = () => resolve(console.log('Light task abstraction'))

const assertAndSendToQueue = (channel, queue) => {
  const bufferedData = Buffer.from(data)

  return channel.assertQueue(queue, assertQueueOptions)
    .then(() => channel.sendToQueue(queue, bufferedData, sendToQueueOptions))
    .then(() => channel.close())
}

const sendHardTaskToQueue = (queue) => amqp.connect(uri)
  .then(connection => connection.createChannel())
  .then(channel => assertAndSendToQueue(channel, queue))

const start = () => lightTask()
  .then(() => sendHardTaskToQueue(workQueue))
  .tap(() => console.log(`The message has been sent to queue${workQueue}`))
  .then(() => sendHardTaskToQueue(workQueue1))
  .tap(() => console.log(`The message has been sent to queue${workQueue1}`))
  .then(() => process.exit(0))

export default start()
