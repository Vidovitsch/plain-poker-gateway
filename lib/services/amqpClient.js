const amqp = require('amqplib/callback_api');
const uuidv4 = require('uuid/v4');
const debug = require('debug')('amqp');

/**
 * [AmqpClient description]
 * @param       {[type]} options [description]
 * @constructor
 */
function AmqpClient(options) {
  this.host = options.host;
  this.exchange = options.exchange || 'plain-poker-main';
  this.sharedConnections = {};
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
      debug(`message sent to ${queue}`);
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
      debug(`fanout message sent for routingkey=${routingKey}`);
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
      channel.ack(message);
      callback(JSON.parse(message.content.toString('utf8')));
      debug(`message received from ${queue}`);
    });
    debug(`listener initialized for queue=${queue}`);
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
A.rpcAsync = function rpcAsync(requestMessage, sendTo) {
  const replyTo = `reply_${uuidv4()}`;
  const connectionPromise = this.connectAsync();
  const channelPromise = connectionPromise.then(connection => this.createChannelAsync(connection));
  const queuePromise = channelPromise.then(channel => this.assertQueueAsync(channel, replyTo, { autoDelete: true }));

  return new Promise((resolve, reject) => {
    Promise.all([connectionPromise, channelPromise, queuePromise]).then(([connection, channel, q]) => {
      channel.consume(q.queue, (replyMessage) => {
        const parsedReplyMessage = JSON.parse(replyMessage.content.toString('utf8'));
        if (parsedReplyMessage.correlationId === requestMessage.correlationId) {
          channel.ack(replyMessage);
          setTimeout(() => {
            connection.close();
          }, 500);
          debug(`rpc request message received from ${replyTo}`);
          resolve(parsedReplyMessage);
        }
      });
      requestMessage.setReplyTo(replyTo);
      channel.sendToQueue(sendTo, Buffer.from(JSON.stringify(requestMessage)));
      debug(`rpc request message sent to ${sendTo}`);
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
      } else {
        resolve(connection);
      }
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
      } else {
        resolve(channel);
      }
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
      } else {
        resolve(q);
      }
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
A.createSharedConnectionAsync = function createSharedConnectionAsync(key) {
  return new Promise((resolve, reject) => {
    const sharedConnection = this.sharedConnections[key];
    if (sharedConnection) {
      resolve(sharedConnection);
    } else {
      this.connectAsync().then((connection) => {
        debug(`shared connection created for key=${key}`);
        this.sharedConnections[key] = connection;
        resolve(connection);
      }).catch((err) => {
        reject(err);
      });
    }
  });
};

/**
 * [description]
 * @param  {[type]} key [description]
 * @return {[type]}     [description]
 */
A.createSharedChannelAsync = function createSharedChannelAsync(key, connectionKey) {
  return new Promise((resolve, reject) => {
    const sharedChannel = this.sharedChannels[key];
    if (sharedChannel) {
      resolve(sharedChannel);
    } else if (connectionKey) {
      this.createSharedConnectionAsync(connectionKey).then(sharedConnection => this.createChannelAsync(sharedConnection)).then((channel) => {
        debug(`shared channel created for key=${key}`);
        this.sharedChannels[key] = channel;
        resolve(channel);
      }).catch((err) => {
        reject(err);
      });
    } else {
      reject(new Error('No connection key given to create a channel with'));
    }
  });
};

A.closeSharedConnection = function closeSharedConnection(key) {
  const sharedConnection = this.sharedConnections[key];
  if (sharedConnection) {
    sharedConnection.close();
  }
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
