const { EventEmitter } = require('events');
const EventMessager = require('./../../services/eventMessager');

// Singleton support
let instance = null;

/**
 * [ClientGateway description]
 * @param  {Object} options [description]
 * @constructor
 */
function TableGameAmqpGateway(amqpClient) {
  this.amqpClient = amqpClient;
  this.eventMessager = new EventMessager(new EventEmitter(), this.amqpClient);
}

const T = TableGameAmqpGateway.prototype;

T.sendCommunityCardsReplyAsync = function sendCommunityCardsReplyAsync(replyData, requestMessage) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendReplyAsync('community-cards-reply', requestMessage, replyData).then((postedMessage) => {
      resolve(postedMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

T.sendPlayerCardsReplyAsync = function sendPlayerCardsReplyAsync(replyData, requestMessage) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendReplyAsync('player-cards-reply', requestMessage, replyData).then((postedMessage) => {
      resolve(postedMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

T.onCommunityCardsRequest = function onCommunityCardsRequest(channelKey, callback) {
  this.eventMessager.onEvent(`table_${this.tableId}`, 'community-cards-request', channelKey, (err, message) => {
    callback(err, message);
  });
};

T.onPlayerCardsRequest = function onPlayerCardsRequest(channelKey, callback) {
  this.eventMessager.onEvent(`table_${this.tableId}`, 'player-cards-request', channelKey, (err, message) => {
    callback(err, message);
  });
};

module.exports = {
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
