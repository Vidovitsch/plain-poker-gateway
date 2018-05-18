const { EventEmitter } = require('events');
const ErrorMessage = require('./../../models/errorMessage');
const EventMessager = require('./../../services/eventMessager');
const RpcMessage = require('./../../models/rpcMessage');

/**
 * [ClientGateway description]
 * @param  {Object} options [description]
 * @constructor
 */
function ClientAmqpGateway(amqpClient) {
  this.amqpClient = amqpClient;
  this.eventMessager = new EventMessager(new EventEmitter(), this.amqpClient);
}

const C = ClientAmqpGateway.prototype;

/**
 * [description]
 * @param  {Object} replyData [description]
 * @param  {Object} request   [description]
 * @return {Promise}           [description]
 */
C.sendCreateTableReplyAsync = function sendCreateTableReplyAsync(replyData, requestMessage) {
  const context = 'create-table-reply';
  const replyMessage = new RpcMessage(context, replyData);
  return new Promise((resolve, reject) => {
    this.amqpClient.sendAsync(replyMessage.toReply(requestMessage), replyMessage.replyTo).then(() => {
      resolve(replyMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [description]
 * @param  {Object} replyData [description]
 * @param  {Object} request   [description]
 * @return {Promise}           [description]
 */
C.sendJoinTableReplyAsync = function sendJoinTableReplyAsync(replyData, requestMessage) {
  const context = 'join-table-reply';
  const replyMessage = replyData instanceof Error ?
    new ErrorMessage(context, replyData) :
    new RpcMessage(context, replyData);
  return new Promise((resolve, reject) => {
    this.amqpClient.sendAsync(replyMessage.toReply(requestMessage), replyMessage.replyTo).then(() => {
      resolve(replyMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [description]
 * @param  {Function} callback [description]
 */
C.onCreateTableRequest = function onCreateTableRequest(channelKey, callback) {
  this.eventMessager.onEvent('table_default', 'create-table-request', channelKey, (err, requestMessage) => {
    callback(err, requestMessage);
  });
};

/**
 * [description]
 * @param  {Function} callback [description]
 */
C.onJoinTableRequest = function onJoinTableRequest(channelKey, callback) {
  this.eventMessager.onEvent('table_default', 'join-table-request', channelKey, (err, requestMessage) => {
    callback(err, requestMessage);
  });
};

module.exports = ClientAmqpGateway;
