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
    callback(err, message);
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
    callback(err, message);
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
