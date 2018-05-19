const { EventEmitter } = require('events');
const EventMessager = require('./../../services/eventMessager');

// Singleton support
let instance = null;

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

/**
 * [onCommunityCardsRequest description]
 * @param  {String}   channelKey  [description]
 * @param  {String}   destination [description]
 * @param  {Function} callback    [description]
 */
T.onCommunityCardsRequest = function onCommunityCardsRequest(channelKey, destination, callback) {
  const args = {
    queue: destination,
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
T.onPlayerCardsRequest = function onPlayerCardsRequest(channelKey, destination, callback) {
  const args = {
    queue: destination,
    context: 'player-cards-request',
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
  getInstance(amqpClient) {
    if (!instance) {
      if (!amqpClient) {
        throw new Error('Invalid argument(s)');
      }
      instance = new TableGameAmqpGateway(amqpClient);
    }
    return instance;
  },
};
