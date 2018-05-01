const { EventEmitter } = require('events');
const AmqpClient = require('./../../services/amqpClient');
const ErrorMessage = require('./../../models/errorMessage');
const EventMessager = require('./../../services/eventMessager');
const RpcMessage = require('./../../models/rpcMessage');

/**
 * [ClientGateway description]
 * @param  {Object} options [description]
 * @constructor
 */
function ClientAmqpGateway(options) {
  this.amqpClient = new AmqpClient(options);
  this.eventMessager = new EventMessager(new EventEmitter(), this.amqpClient);
}

const C = ClientAmqpGateway.prototype;

/**
 * [description]
 * @param  {Object} replyData [description]
 * @param  {Object} request   [description]
 * @return {Promise}           [description]
 */
C.sendCreateTableReply = function sendCreateTableReply(replyData, request) {
  const context = 'create-table-reply';
  const message = replyData instanceof Error ?
    new ErrorMessage(context, replyData) :
    new RpcMessage(context, replyData);
  return new Promise((resolve, reject) => {
    this.amqpClient.sendAsync(message.toReply(request), message.replyTo).then(() => {
      resolve();
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [description]
 * @param  {Function} callback [description]
 */
C.onTableCreationRequest = function onTableCreationRequest(callback) {
  this.eventMessager.onEvent('table_default', 'create-table-request', (request) => {
    callback(request);
  });
};

/**
 * [description]
 * @param  {Function} callback [description]
 */
C.onTableRemovalRequest = function onTableRemovalRequest(callback) {
  this.eventMessager.onEvent('table_default', 'remove-table-request', (request) => {
    callback(request);
  });
};

/**
 * [description]
 * @param  {Function} callback [description]
 */
C.onTableUpdateRequest = function onTableUpdateRequest(callback) {
  this.eventMessager.onEvent('table_default', 'update-table-request', (request) => {
    callback(request);
  });
};

/**
 * [description]
 * @param  {Function} callback [description]
 */
C.onTableJoinRequest = function onTableJoinRequest(callback) {
  this.eventMessager.onEvent('table_default', 'join-table-request', (request) => {
    callback(request);
  });
};

module.exports = ClientAmqpGateway;
