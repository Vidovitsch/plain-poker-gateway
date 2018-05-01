const amqp = require('amqplib/callback_api');

/**
 * [AmqpClient description]
 * @param       {[type]} options [description]
 * @constructor
 */
function AmqpClient(options) {
  this.host = options.host;
  this.exchange = options.exchange || 'plain-poker-main';
  this.sharedConnection = null;
  this.sharedChannels = {};
  // list of queues that are currently listened to
  this.listenerQueues = [];
}

const A = AmqpClient.prototype;

/**
 * [description]
 * @param  {Message} message [description]
 * @param  {string} queue   [description]
 * @return {Promise}         [description]
 */
A.sendAsync = function sendAsync(message, queue) {
  return new Promise((resolve, reject) => {
    // Create promises
    const connectionPromise = this.connectAsync();
    const channelPromise = connectionPromise.then(connection => this.createChannelAsync(connection));

    Promise.all([connectionPromise, channelPromise]).then(([connection, channel]) => {
      channel.assertExchange(this.exchange, 'direct', { durable: true });
      message.setCurrentTimestamp();
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
      setTimeout(() => {
        connection.close();
      }, 500);
      resolve();
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * Sends a message with a given routingKey.
 * All queues bound to that routingKey will receive a message (fanout).
 *
 * @param  {Message} message    [description]
 * @param  {string} routingKey [description]
 * @return {Promise}            [description]
 */
A.fanoutAsync = function fanoutAsync(message, routingKey) {
  return new Promise((resolve, reject) => {
    // Create promises
    const connectionPromise = this.connectAsync();
    const channelPromise = connectionPromise.then(connection => this.createChannelAsync(connection));

    Promise.all([connectionPromise, channelPromise]).then(([connection, channel]) => {
      channel.assertExchange(this.exchange, 'direct', { durable: true });
      message.setCurrentTimestamp();
      channel.publish(this.exchange, routingKey, Buffer.from(JSON.stringify(message)));
      setTimeout(() => {
        connection.close();
      }, 500);
      resolve();
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * Listens continuously to a specific queue.
 *
 * @param  {Channel}   channel     [description]
 * @param  {string}   queue       [description]
 * @param  {Function} callback    [description]
 */
A.listen = function listen(channel, queue, callback) {
  // Make sure the exchange exists
  channel.assertExchange(this.exchange, 'direct', { durable: true });
  // Make sure the queue exists
  this.assertQueueAsync(channel, queue, { autoDelete: true }).then((q) => {
    this.listenerQueues.push(q.queue);

    // Bind queue with exchange by means of a routingKey
    channel.consume(q.queue, (msg) => {
      if (!msg.content.status !== 'reply') {
        // Let RabbitMQ know the message has been received successfully
        channel.ack(msg);
        callback(null, JSON.parse(msg.content.toString('utf8')));
      }
    });
  }).catch((err) => {
    callback(err);
  });
};

/**
 * Sends a message to a queue and expects a reply to that message.
 * This function support request/reply patterns.
 *
 * @param  {Message} message [description]
 * @param  {string} sendTo  [description]
 * @param  {string} replyTo [description]
 * @return {Promise}         [description]
 */
A.rpcAsync = function rpcAsync(message, sendTo, replyTo) {
  return new Promise((resolve, reject) => {
    // Create promises
    const connectionPromise = this.connectAsync();
    const channelPromise = connectionPromise.then(connection => this.createChannelAsync(connection));
    const queuePromise = channelPromise.then(channel => this.assertQueueAsync(channel, replyTo, { autoDelete: true }));

    // Wait till all promises are met
    Promise.all([connectionPromise, channelPromise, queuePromise]).then(([connection, channel, q]) => {
      const { correlationId } = message;
      console.log(q.queue);
      channel.consume(q.queue, (msg) => {
        const jsonMessage = JSON.parse(message.content.toString('utf8'));
        if (jsonMessage.correlationId === correlationId && jsonMessage.status === 'reply') {
          channel.ack(msg);
          setTimeout(() => {
            connection.close();
          }, 500);
          resolve(jsonMessage);
        }
      });
      message.setReplyTo(replyTo);
      channel.sendToQueue(sendTo, Buffer.from(JSON.stringify(message)));
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [description]
 * @return {[type]} [description]
 */
A.connectAsync = function connectAsync() {
  return new Promise((resolve, reject) => {
    amqp.connect(`amqp://${this.host}`, (err, connection) => {
      if (err) {
        reject(err);
      }
      resolve(connection);
    });
  });
};

/**
 * [description]
 * @param  {[type]} connection [description]
 * @return {[type]}            [description]
 */
A.createChannelAsync = function createChannelAsync(connection) {
  return new Promise((resolve, reject) => {
    connection.createChannel((err, channel) => {
      if (err) {
        reject(err);
      }
      resolve(channel);
    });
  });
};

/**
 * [description]
 * @param  {[type]} channel [description]
 * @param  {[type]} queue   [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
A.assertQueueAsync = function assertQueueAsync(channel, queue, options) {
  return new Promise((resolve, reject) => {
    channel.assertQueue(queue, options, (err, q) => {
      if (err) {
        reject(err);
      }
      resolve(q);
    });
  });
};

/**
 * [description]
 * @param  {[type]} channel    [description]
 * @param  {[type]} queue      [description]
 * @param  {[type]} routingKey [description]
 */
A.bindQueue = function bindQueue(channel, queue, routingKey) {
  channel.bindQueue(queue, this.exchange, routingKey);
};

/**
 * [description]
 * @return {[type]} [description]
 */
A.getSharedConnectionAsync = function getSharedConnectionAsync() {
  return new Promise((resolve, reject) => {
    if (this.sharedConnection) {
      resolve(this.sharedConnection);
    }
    this.connectAsync().then((connection) => {
      this.sharedConnection = connection;
      resolve(this.sharedConnection);
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [description]
 * @param  {[type]} key [description]
 * @return {[type]}     [description]
 */
A.getSharedChannelAsync = function getSharedChannelAsync(key) {
  return new Promise((resolve, reject) => {
    const sharedChannel = this.sharedChannels[key];
    if (sharedChannel) {
      resolve(sharedChannel);
    }
    this.getSharedConnectionAsync().then(sharedConnection => this.createChannelAsync(sharedConnection)).then((channel) => {
      this.sharedChannels[key] = channel;
      resolve(channel);
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [description]
 * @param  {[type]} queue [description]
 * @return {[type]}       [description]
 */
A.isListening = function isListening(queue) {
  return this.listenerQueues.indexOf(queue) >= 0;
};

module.exports = AmqpClient;
