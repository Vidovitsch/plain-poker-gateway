const { EventEmitter } = require('events');
const EventMessager = require('./../../services/eventMessager');

/**
 * [TableGameAmqpGateway description]
 * @param       {AmqpClient} amqpClient [description]
 * @constructor
 */
function TableGameAmqpGateway(amqpClient) {
  this.amqpClient = amqpClient;
  this.eventMessager = EventMessager.createInstance(new EventEmitter(), this.amqpClient);
}

const T = TableGameAmqpGateway.prototype;

/**
 * [sendStartGameRequestAsync description]
 * @param  {String} sessionId [description]
 * @param  {String} sendTo    [description]
 * @return {Promise}           [description]
 */
T.sendStartGameRequestAsync = function sendStartGameRequestAsync(sessionId, sendTo) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendRequestAsync('start-game-request', sendTo, {
      sessionId,
    }).then((replyMessage) => {
      resolve(replyMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [sendStartGameRequestAsync description]
 * @param  {String} sessionId [description]
 * @param  {String} sendTo    [description]
 * @return {Promise}           [description]
 */
T.sendReadyGameRequestAsync = function sendStartGameRequestAsync(sessionId, sendTo) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendRequestAsync('ready-game-request', sendTo, {
      sessionId,
    }).then((replyMessage) => {
      resolve(replyMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

T.sendLeaveGameRequestAsync = function sendLeaveGameRequestAsync(sessionId, sendTo) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendRequestAsync('leave-game-request', sendTo, {
      sessionId,
    }).then((replyMessage) => {
      resolve(replyMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

T.sendResetGameRequestAsync = function sendResetGameRequestAsync(sessionId, sendTo) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendRequestAsync('reset-game-request', sendTo, {
      sessionId,
    }).then((replyMessage) => {
      resolve(replyMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [sendCheckRequestAsync description]
 * @param  {String} sessionId [description]
 * @param  {String} sendTo    [description]
 * @return {Promise}           [description]
 */
T.sendCheckRequestAsync = function sendCheckRequestAsync(sessionId, sendTo) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendRequestAsync('check-request', sendTo, {
      sessionId,
    }).then((replyMessage) => {
      resolve(replyMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [sendCallRequestAsync description]
 * @param  {String}} sessionId [description]
 * @param  {String} sendTo    [description]
 * @return {Promise}           [description]
 */
T.sendCallRequestAsync = function sendCallRequestAsync(sessionId, sendTo) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendRequestAsync('call-request', sendTo, {
      sessionId,
    }).then((replyMessage) => {
      resolve(replyMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [sendBetRequestAsync description]
 * @param  {String} sessionId [description]
 * @param  {Number} amount    [description]
 * @param  {String} sendTo    [description]
 * @return {Promise}           [description]
 */
T.sendBetRequestAsync = function sendBetRequestAsync(sessionId, amount, sendTo) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendRequestAsync('bet-request', sendTo, {
      sessionId,
      amount,
    }).then((replyMessage) => {
      resolve(replyMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [sendRaiseRequestAsync description]
 * @param  {String} sessionId [description]
 * @param  {Number} amount    [description]
 * @param  {String} sendTo    [description]
 * @return {Promise}           [description]
 */
T.sendRaiseRequestAsync = function sendRaiseRequestAsync(sessionId, amount, sendTo) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendRequestAsync('raise-request', sendTo, {
      sessionId,
      amount,
    }).then((replyMessage) => {
      resolve(replyMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [sendFoldRequestAsync description]
 * @param  {String} sessionId [description]
 * @param  {String} sendTo    [description]
 * @return {Promise}           [description]
 */
T.sendFoldRequestAsync = function sendFoldRequestAsync(sessionId, sendTo) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendRequestAsync('fold-request', sendTo, {
      sessionId,
    }).then((replyMessage) => {
      resolve(replyMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [sendCommunityCardsReplyAsync description]
 * @param  {Object} replyData      [description]
 * @param  {RpcMessage} requestMessage [description]
 * @return {Promise}                [description]
 */
T.sendCommunityCardsReplyAsync = function sendCommunityCardsReplyAsync(replyData, requestMessage) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendReplyAsync('community-cards-reply', requestMessage, replyData).then((postedMessage) => {
      resolve(postedMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [sendPlayerCardsReplyAsync description]
 * @param  {Object} replyData      [description]
 * @param  {RpcMessage} requestMessage [description]
 * @return {Promise}                [description]
 */
T.sendPlayerCardsReplyAsync = function sendPlayerCardsReplyAsync(replyData, requestMessage) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendReplyAsync('player-cards-reply', requestMessage, replyData).then((postedMessage) => {
      resolve(postedMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

T.sendEndGameReplyAsync = function sendEndGameReplyAsync(replyData, requestMessage) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendReplyAsync('end-game-reply', requestMessage, replyData).then((postedMessage) => {
      resolve(postedMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

T.sendReturnCardsReplyAsync = function sendReturnCardsReplyAsync(replyData, requestMessage) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendReplyAsync('return-cards-request', requestMessage, replyData).then((postedMessage) => {
      resolve(postedMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

T.onPlayerCards = function onPlayerCards(channelKey, listenTo, callback) {
  const args = {
    queue: listenTo,
    context: 'player-cards',
    channelKey,
  };
  this.eventMessager.onEvent(args, (err, message) => {
    callback(message);
  });
};

T.onUpdate = function onUpdate(channelKey, listenTo, tableLocation, callback) {
  const args = {
    queue: listenTo,
    context: 'table-update',
    channelKey,
    routingKey: `update_${tableLocation}`,
  };
  this.eventMessager.onEvent(args, (err, message) => {
    callback(err, message);
  });
};

/**
 * [onCommunityCardsRequest description]
 * @param  {String}   channelKey  [description]
 * @param  {String}   destination [description]
 * @param  {Function} callback    [description]
 */
T.onCommunityCardsRequest = function onCommunityCardsRequest(channelKey, listenTo, callback) {
  const args = {
    queue: listenTo,
    context: 'community-cards-request',
    channelKey,
  };
  this.eventMessager.onEvent(args, (err, message) => {
    callback(message);
  });
};

/**
 * [onPlayerCardsRequest description]
 * @param  {String}   channelKey  [description]
 * @param  {String}   destination [description]
 * @param  {Function} callback    [description]
 */
T.onPlayerCardsRequest = function onPlayerCardsRequest(channelKey, listenTo, callback) {
  const args = {
    queue: listenTo,
    context: 'player-cards-request',
    channelKey,
  };
  this.eventMessager.onEvent(args, (err, message) => {
    callback(message);
  });
};

T.onEndGameRequest = function onEndGameRequest(channelKey, listenTo, callback) {
  const args = {
    queue: listenTo,
    context: 'end-game-request',
    channelKey,
  };
  this.eventMessager.onEvent(args, (err, message) => {
    callback(err, message);
  });
};

T.onReturnCardsRequestAsync = function onReturnCardsRequestAsync(channelKey, listenTo, callback) {
  const args = {
    queue: listenTo,
    context: 'return-cards-request',
    channelKey,
  };
  this.eventMessager.onEvent(args, (err, message) => {
    callback(message);
  });
};

module.exports = {
  /**
   * [getInstance description]
   * @param  {AmqpClient} amqpClient [description]
   * @return {TableGameAmqpGateway}            [description]
   * @return {Error}            [description]
   */
  createInstance(amqpClient) {
    if (!amqpClient) {
      throw new Error('Invalid argument(s)');
    }
    return new TableGameAmqpGateway(amqpClient);
  },
};
