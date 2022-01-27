
const rabbitConfig = {
  uri: process.env.rabbbitUri || 'amqp://localhost',
  workQueue: process.env.workQueue || 'workQueue',
  workQueue1: process.env.workQueue || 'workQueue1',
}

export default rabbitConfig
