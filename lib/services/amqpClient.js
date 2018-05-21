const amqp = require('amqplib/callback_api');
const uuidv4 = require('uuid/v4');
const debug = require('debug')('amqp');
const RpcMessage = require('./../models/rpcMessage');

// Singleton support
let instance = null;

/**
 * [AmqpClient description]
 * @param       {Object} args [description]
 * @constructor
 */
function AmqpClient(args) {
  this.host = args.host;
  this.exchange = args.exchange || 'plain-poker-main';
  this.sharedConnections = {};
  this.sharedChannels = {};
  // list of queues that are currently listened to
  this.listeners = {};
}

const A = AmqpClient.prototype;

/**
 * [sendAsync description]
 * @param  {Message} message [description]
 * @param  {String} queue   [description]
 * @return {Promise}         [description]
 */
A.sendAsync = function sendAsync(message, queue) {
  return new Promise((resolve, reject) => {
    const connectionPromise = this.connectAsync();
    const channelPromise = connectionPromise.then(connection => this.createChannelAsync(connection));
    Promise.all([connectionPromise, channelPromise]).then(([connection, channel]) => {
      channel.assertExchange(this.exchange, 'direct', { durable: true });
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
      setTimeout(() => {
        connection.close();
      }, 500);
      debug(`(default) Message sent => [destination:${queue}], [context:${message.context}]`);
      resolve();
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [fanoutAsync description]
 * @param  {Message} message    [description]
 * @param  {String} routingKey [description]
 * @return {Promise}            [description]
 */
A.fanoutAsync = function fanoutAsync(message, routingKey) {
  return new Promise((resolve, reject) => {
    const connectionPromise = this.connectAsync();
    const channelPromise = connectionPromise.then(connection => this.createChannelAsync(connection));
    Promise.all([connectionPromise, channelPromise]).then(([connection, channel]) => {
      channel.assertExchange(this.exchange, 'direct', { durable: true });
      channel.publish(this.exchange, routingKey, Buffer.from(JSON.stringify(message)));
      setTimeout(() => {
        connection.close();
      }, 500);
      debug(`(fanout) Message sent => [routing:${routingKey}], [context:${message.context}]`);
      resolve();
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [listen description]
 * @param  {Channel}   channel  [description]
 * @param  {String}   queue    [description]
 * @param  {Function} callback [description]
 */
A.listen = function listen(channel, queue, callback) {
  channel.assertExchange(this.exchange, 'direct', { durable: true });
  this.assertQueueAsync(channel, queue, { autoDelete: true }).then((q) => {
    channel.consume(q.queue, (message) => {
      channel.ack(message);
      const parsedMessage = JSON.parse(message.content.toString('utf8'));
      debug(`Message received => [origin:${q.queue}], [context:${parsedMessage.context}]`);
      callback(parsedMessage);
    });
    debug(`Continuous listener started => [queue:${queue}]`);
  }).catch((err) => {
    callback(err);
  });
};

/**
 * [rpcAsync description]
 * @param  {RpcMessage} requestMessage [description]
 * @param  {String} sendTo         [description]
 * @return {Promise}                [description]
 */
A.rpcAsync = function rpcAsync(requestMessage, sendTo) {
  return new Promise((resolve, reject) => {
    const replyTo = `reply_${uuidv4()}`;
    const connectionPromise = this.connectAsync();
    const channelPromise = connectionPromise.then(connection => this.createChannelAsync(connection));
    const queuePromise = channelPromise.then(channel => this.assertQueueAsync(channel, replyTo, { autoDelete: true }));
    Promise.all([connectionPromise, channelPromise, queuePromise]).then(([connection, channel, q]) => {
      channel.consume(q.queue, (replyMessage) => {
        const parsedReplyMessage = JSON.parse(replyMessage.content.toString('utf8'));
        if (parsedReplyMessage.correlationId === requestMessage.correlationId) {
          channel.ack(replyMessage);
          setTimeout(() => {
            connection.close();
          }, 500);
          debug(`(reply) Message received => [origin:${q.queue}], [context:${parsedReplyMessage.context}], [correlation:${parsedReplyMessage.correlationId}]`);
          resolve(parsedReplyMessage);
        }
      });
      requestMessage.setReplyTo(replyTo);
      channel.sendToQueue(sendTo, Buffer.from(JSON.stringify(requestMessage)));
      debug(`(request) Message sent => [destination:${sendTo}], [context:${requestMessage.context}], [correlation:${requestMessage.correlationId}]`);
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [sendReplyAsync description]
 * @param  {String} context        [description]
 * @param  {RpcMessage} requestMessage [description]
 * @param  {Object} replyData      [description]
 * @return {Promise}                [description]
 */
A.sendReplyAsync = function sendReplyAsync(context, requestMessage, replyData) {
  return new Promise((resolve, reject) => {
    let replyMessage = RpcMessage.createInstance(context, replyData).toReply(requestMessage);
    if (replyData instanceof Error) {
      replyMessage = replyMessage.toError();
    }
    this.sendAsync(replyMessage, replyMessage.replyTo).then(() => {
      resolve(replyMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [sendRequestAsync description]
 * @param  {String} context [description]
 * @param  {String} sendTo  [description]
 * @param  {Object} data    [description]
 * @return {Promise}         [description]
 */
A.sendRequestAsync = function sendRequestAsync(context, sendTo, data) {
  return new Promise((resolve, reject) => {
    const requestMessage = RpcMessage.createInstance(context, data);
    this.rpcAsync(requestMessage, sendTo).then((replyMessage) => {
      resolve(replyMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [connectAsync description]
 * @return {Promise} [description]
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
 * [createChannelAsync description]
 * @param  {Connection} connection [description]
 * @return {Promise}            [description]
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
 * [assertQueueAsync description]
 * @param  {Channel} channel [description]
 * @param  {String} queue   [description]
 * @param  {Object} options [description]
 * @return {Promise}         [description]
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
 * [bindQueue description]
 * @param  {Channel} channel    [description]
 * @param  {String} queue      [description]
 * @param  {String} routingKey [description]
 */
A.bindQueue = function bindQueue(channel, queue, routingKey) {
  channel.bindQueue(queue, this.exchange, routingKey);
};

/**
 * [createSharedConnectionAsync description]
 * @param  {String} key [description]
 * @return {Promise}     [description]
 */
A.createSharedConnectionAsync = function createSharedConnectionAsync(key) {
  return new Promise((resolve, reject) => {
    const sharedConnection = this.sharedConnections[key];
    if (sharedConnection) {
      resolve(sharedConnection);
    } else {
      this.connectAsync().then((connection) => {
        debug(`(shared) Connection created => [key:${key}]`);
        this.sharedConnections[key] = connection;
        resolve(connection);
      }).catch((err) => {
        reject(err);
      });
    }
  });
};

/**
 * [createSharedChannelAsync description]
 * @param  {String} key           [description]
 * @param  {String} connectionKey [description]
 * @return {Promise}               [description]
 */
A.createSharedChannelAsync = function createSharedChannelAsync(key, connectionKey) {
  return new Promise((resolve, reject) => {
    const sharedChannel = this.sharedChannels[key];
    if (sharedChannel) {
      reject(new Error(`Channel with key '${key}' already exists`));
    } else {
      this.createSharedConnectionAsync(connectionKey).then(sharedConnection => this.createChannelAsync(sharedConnection)).then((channel) => {
        debug(`(shared) Channel created => [key:${key}]`);
        this.sharedChannels[key] = channel;
        resolve(channel);
      }).catch((err) => {
        reject(err);
      });
    }
  });
};

/**
 * [getSharedChannel description]
 * @param  {String} key [description]
 * @return {Channel}     [description]
 * @return {Error}     [description]
 */
A.getSharedChannel = function getSharedChannel(key) {
  const sharedChannel = this.sharedChannels[key];
  if (!sharedChannel) {
    return new Error(`Channel with key '${key}' doesn't exist`);
  }
  return sharedChannel;
};

/**
 * [closeSharedConnection description]
 * @param  {String} key [description]
 */
A.closeSharedConnection = function closeSharedConnection(key) {
  const sharedConnection = this.sharedConnections[key];
  if (sharedConnection) {
    sharedConnection.close();
  }
};

/**
 * [setListener description]
 * @param {String} queue      [description]
 * @param {String} channelKey [description]
 * @return {Channel}     [description]
 * @return {Error}     [description]
 */
A.setListener = function setListener(queue, channelKey) {
  const value = this.listeners[queue];
  if (!value) {
    this.listeners[queue] = [];
  }
  if (!this.listeners[queue].includes(channelKey)) {
    this.listeners[queue].push(channelKey);
  } else {
    return new Error(`Channelkey '${channelKey}' is already included for this queue`);
  }
  return this.getSharedChannel(channelKey);
};

/**
 * [isListening description]
 * @param  {String}  queue      [description]
 * @param  {String}  channelKey [description]
 * @return {Boolean}            [description]
 */
A.isListening = function isListening(queue, channelKey) {
  return this.listeners[queue] ? this.listeners[queue].includes(channelKey) : false;
};

module.exports = {
  /**
   * [getInstance description]
   * @param  {Object} args [description]
   * @return {AmqpClient}      [description]
   * @return {Error}      [description]
   */
  getInstance(args) {
    if (!instance) {
      if (!args.host || !args.exchange) {
        return new Error('Invalid argument(s)');
      }
      instance = new AmqpClient(args);
    }
    return instance;
  },
};
