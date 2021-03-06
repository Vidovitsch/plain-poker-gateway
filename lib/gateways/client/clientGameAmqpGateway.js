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

/**
 * [broadcastUpdateAsync description]
 * @param  {VariableTable} variableTable [description]
 * @param  {String} tableLocation [description]
 * @return {Promise}               [description]
 */
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
 * [sendCheckReplyAsync description]
 * @param  {Object} replyData      [description]
 * @param  {RpcMessage} requestMessage [description]
 * @return {Promise}                [description]
 */
C.sendCheckReplyAsync = function sendCheckReplyAsync(replyData, requestMessage) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendReplyAsync('check-reply', requestMessage, replyData).then((postedMessage) => {
      resolve(postedMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [sendCallReplyAsync description]
 * @param  {Object} replyData      [description]
 * @param  {RpcMessage} requestMessage [description]
 * @return {Promise}                [description]
 */
C.sendCallReplyAsync = function sendCallReplyAsync(replyData, requestMessage) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendReplyAsync('call-reply', requestMessage, replyData).then((postedMessage) => {
      resolve(postedMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [sendBetReplyAsync description]
 * @param  {Object} replyData      [description]
 * @param  {RpcMessage} requestMessage [description]
 * @return {Promise}                [description]
 */
C.sendBetReplyAsync = function sendBetReplyAsync(replyData, requestMessage) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendReplyAsync('bet-reply', requestMessage, replyData).then((postedMessage) => {
      resolve(postedMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [sendRaiseReplyAsync description]
 * @param  {Object} replyData      [description]
 * @param  {RpcMessage} requestMessage [description]
 * @return {Promise}                [description]
 */
C.sendRaiseReplyAsync = function sendRaiseReplyAsync(replyData, requestMessage) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendReplyAsync('raise-reply', requestMessage, replyData).then((postedMessage) => {
      resolve(postedMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [sendFoldReplyAsync description]
 * @param  {Object} replyData      [description]
 * @param  {RpcMessage} requestMessage [description]
 * @return {Promise}                [description]
 */
C.sendFoldReplyAsync = function sendFoldReplyAsync(replyData, requestMessage) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendReplyAsync('fold-reply', requestMessage, replyData).then((postedMessage) => {
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

C.onResetGameRequestAsync = function onResetGameRequestAsync(channelKey, receiveFrom, callback) {
  const args = {
    queue: receiveFrom,
    context: 'reset-game-request',
    channelKey,
  };
  this.eventMessager.onEvent(args, (err, requestMessage) => {
    debug(err);
    callback(requestMessage);
  });
};

/**
 * [onCheckRequestAsync description]
 * @param  {String}   channelKey  [description]
 * @param  {String}   receiveFrom [description]
 * @param  {Function} callback    [description]
 */
C.onCheckRequestAsync = function onCheckRequestAsync(channelKey, receiveFrom, callback) {
  const args = {
    queue: receiveFrom,
    context: 'check-request',
    channelKey,
  };
  this.eventMessager.onEvent(args, (err, requestMessage) => {
    debug(err);
    callback(requestMessage);
  });
};

/**
 * [onCallRequestAsync description]
 * @param  {String}   channelKey  [description]
 * @param  {String}   receiveFrom [description]
 * @param  {Function} callback    [description]
 */
C.onCallRequestAsync = function onCallRequestAsync(channelKey, receiveFrom, callback) {
  const args = {
    queue: receiveFrom,
    context: 'call-request',
    channelKey,
  };
  this.eventMessager.onEvent(args, (err, requestMessage) => {
    debug(err);
    callback(requestMessage);
  });
};

/**
 * [onBetRequestAsync description]
 * @param  {String}   channelKey  [description]
 * @param  {String}   receiveFrom [description]
 * @param  {Function} callback    [description]
 */
C.onBetRequestAsync = function onBetRequestAsync(channelKey, receiveFrom, callback) {
  const args = {
    queue: receiveFrom,
    context: 'bet-request',
    channelKey,
  };
  this.eventMessager.onEvent(args, (err, requestMessage) => {
    debug(err);
    callback(requestMessage);
  });
};

/**
 * [onRaiseRequestAsync description]
 * @param  {String}   channelKey  [description]
 * @param  {String}   receiveFrom [description]
 * @param  {Function} callback    [description]
 */
C.onRaiseRequestAsync = function onRaiseRequestAsync(channelKey, receiveFrom, callback) {
  const args = {
    queue: receiveFrom,
    context: 'raise-request',
    channelKey,
  };
  this.eventMessager.onEvent(args, (err, requestMessage) => {
    debug(err);
    callback(requestMessage);
  });
};

/**
 * [onFoldRequestAsync description]
 * @param  {String}   channelKey  [description]
 * @param  {String}   receiveFrom [description]
 * @param  {Function} callback    [description]
 */
C.onFoldRequestAsync = function onFoldRequestAsync(channelKey, receiveFrom, callback) {
  const args = {
    queue: receiveFrom,
    context: 'fold-request',
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
