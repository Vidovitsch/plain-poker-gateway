const { EventEmitter } = require('events');
const EventMessager = require('./../../services/eventMessager');
const RpcMessage = require('./../../models/rpcMessage');
const ErrorMessage = require('./../../models/errorMessage');

/**
 * [ClientGateway description]
 * @param  {Object} options [description]
 * @constructor
 */
function TableGameAmqpGateway(amqpClient, tableId) {
  this.tableId = tableId;
  this.amqpClient = amqpClient;
  this.eventMessager = new EventMessager(new EventEmitter(), this.amqpClient);
}

const T = TableGameAmqpGateway.prototype;

T.sendCommunityCardsReplyAsync = function sendCommunityCardsReplyAsync(replyData, requestMessage) {
  const context = 'community-cards-reply';
  const replyMessage = replyData instanceof Error ?
    new ErrorMessage(context, replyData) :
    new RpcMessage(context, replyData);
  return new Promise((resolve, reject) => {
    this.amqpClient.sendAsync(replyMessage.toReply(requestMessage), replyMessage.replyTo).then(() => {
      resolve();
    }).catch((err) => {
      reject(err);
    });
  });
};

T.sendPlayerCardsReplyAsync = function sendPlayerCardsReplyAsync(replyData, requestMessage) {
  const context = 'player-cards-reply';
  const replyMessage = replyData instanceof Error ?
    new ErrorMessage(context, replyData) :
    new RpcMessage(context, replyData);
  return new Promise((resolve, reject) => {
    this.amqpClient.sendAsync(replyMessage.toReply(requestMessage), replyMessage.replyTo).then(() => {
      resolve();
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

module.exports = TableGameAmqpGateway;
