const debug = require('debug')('amqp');
const { EventEmitter } = require('events');
const EventMessager = require('./../../services/eventMessager');
const Message = require('./../../models/message');

/**
 * [ClientGameAmqpGateway description]
 * @param       {AmqpClient} amqpClient [description]
 * @constructor
 */
function ClientGameAmqpGateway(amqpClient) {
  this.amqpClient = amqpClient;
  this.eventMessager = EventMessager.createInstance(new EventEmitter(), this.amqpClient);
}

const C = ClientGameAmqpGateway.prototype;

C.sendLeaveGameReplyAsync = function sendLeaveGameReplyAsync(replyData, requestMessage) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendReplyAsync('leave-game-reply', requestMessage, replyData).then((postedMessage) => {
      resolve(postedMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

C.sendPlayerCardsAsync = function sendPlayerCardsAsync(cards, playerLocation) {
  return new Promise((resolve, reject) => {
    const message = new Message('player-cards', { cards });
    this.amqpClient.sendAsync(message, playerLocation).then(() => {
      resolve();
    }).catch((err) => {
      reject(err);
    });
  });
};

C.broadcastUpdateAsync = function broadcastUpdateAsync(variableTable, tableLocation) {
  return new Promise((resolve, reject) => {
    const message = new Message('table-update', variableTable);
    this.amqpClient.fanoutAsync(message, `update_${tableLocation}`).then(() => {
      resolve();
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [onLeaveGameRequestAsync description]
 * @param  {String}   channelKey  [description]
 * @param  {String}   receiveFrom [description]
 * @param  {Function} callback    [description]
 */
C.onStartGameRequestAsync = function onLeaveGameRequestAsync(channelKey, receiveFrom, callback) {
  const args = {
    queue: receiveFrom,
    context: 'start-game-request',
    channelKey,
  };
  this.eventMessager.onEvent(args, (err, requestMessage) => {
    debug(err);
    callback(requestMessage);
  });
};

/**
 * [sendStartGameReplyAsync description]
 * @param  {Object} replyData      [description]
 * @param  {RpcMessage} requestMessage [description]
 * @return {Promise}                [description]
 */
C.sendStartGameReplyAsync = function sendStartGameReplyAsync(replyData, requestMessage) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendReplyAsync('start-game-reply', requestMessage, replyData).then((postedMessage) => {
      resolve(postedMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [onReadyGameRequestAsync description]
 * @param  {String}   channelKey  [description]
 * @param  {String}   receiveFrom [description]
 * @param  {Function} callback    [description]
 */
C.onReadyGameRequestAsync = function onReadyGameRequestAsync(channelKey, receiveFrom, callback) {
  const args = {
    queue: receiveFrom,
    context: 'ready-game-request',
    channelKey,
  };
  this.eventMessager.onEvent(args, (err, requestMessage) => {
    debug(err);
    callback(requestMessage);
  });
};

/**
 * [sendGameReadyReplyAsync description]
 * @param  {Object} replyData      [description]
 * @param  {RpcMessage} requestMessage [description]
 * @return {Promise}                [description]
 */
C.sendReadyGameReplyAsync = function sendReadyGameReplyAsync(replyData, requestMessage) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendReplyAsync('ready-game-reply', requestMessage, replyData).then((postedMessage) => {
      resolve(postedMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

C.onLeaveGameRequestAsync = function onLeaveGameRequestAsync(channelKey, receiveFrom, callback) {
  const args = {
    queue: receiveFrom,
    context: 'leave-game-request',
    channelKey,
  };
  this.eventMessager.onEvent(args, (err, requestMessage) => {
    debug(err);
    callback(requestMessage);
  });
};

module.exports = {
  /**
   * [getInstance description]
   * @param  {AmqpClient} amqpClient [description]
   * @return {ClientGameAmqpGateway}            [description]
   * @return {Error}            [description]
   */
  createInstance(amqpClient) {
    if (!amqpClient) {
      throw new Error('Invalid argument(s)');
    }
    return new ClientGameAmqpGateway(amqpClient);
  },
};
