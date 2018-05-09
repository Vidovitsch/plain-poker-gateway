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
  const connectionPromise = this.connectAsync();
  const channelPromise = connectionPromise.then(connection => this.createChannelAsync(connection));

  return new Promise((resolve, reject) => {
    // Wait till connection and channel are created
    Promise.all([connectionPromise, channelPromise]).then(([connection, channel]) => {
      channel.assertExchange(this.exchange, 'direct', { durable: true });
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
  const connectionPromise = this.connectAsync();
  const channelPromise = connectionPromise.then(connection => this.createChannelAsync(connection));

  return new Promise((resolve, reject) => {
    Promise.all([connectionPromise, channelPromise]).then(([connection, channel]) => {
      channel.assertExchange(this.exchange, 'direct', { durable: true });
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
 * [listen description]
 * @param  {[type]}   channel  [description]
 * @param  {[type]}   queue    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
A.listen = function listen(channel, queue, callback) {
  channel.assertExchange(this.exchange, 'direct', { durable: true });
  this.assertQueueAsync(channel, queue, { autoDelete: true }).then((q) => {
    this.listenerQueues.push(q.queue);
    channel.consume(q.queue, (message) => {
      const parsedMessage = JSON.parse(message.content.toString('utf8'));
      if (parsedMessage.status !== 'reply') {
        channel.ack(message);
        callback(parsedMessage);
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
A.rpcAsync = function rpcAsync(requestMessage, sendTo, replyTo) {
  const connectionPromise = this.connectAsync();
  const channelPromise = connectionPromise.then(connection => this.createChannelAsync(connection));
  const queuePromise = channelPromise.then(channel => this.assertQueueAsync(channel, replyTo, { autoDelete: true }));

  return new Promise((resolve, reject) => {
    Promise.all([connectionPromise, channelPromise, queuePromise]).then(([connection, channel, q]) => {
      channel.consume(q.queue, (replyMessage) => {
        const parsedReplyMessage = JSON.parse(replyMessage.content.toString('utf8'));
        if (parsedReplyMessage.correlationId === requestMessage.correlationId && parsedReplyMessage.status === 'reply') {
          channel.ack(replyMessage);
          setTimeout(() => {
            connection.close();
          }, 500);
          resolve(parsedReplyMessage);
        }
      });
      requestMessage.setReplyTo(replyTo);
      channel.sendToQueue(sendTo, Buffer.from(JSON.stringify(requestMessage)));
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
 * [createSharedConnectionAsync description]
 * @return {[type]} [description]
 */
A.createSharedConnectionAsync = function createSharedConnectionAsync() {
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
    if (this.sharedConnection) {
      this.createChannelAsync(this.sharedConnection).then((channel) => {
        this.sharedChannels[key] = channel;
        resolve(channel);
      }).catch((err) => {
        reject(err);
      });
    } else {
      reject(new Error('No shared connection initialized'));
    }
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