const { EventEmitter } = require('events');
const AmqpClient = require('./../../services/amqpClient');
const ErrMessage = require('./../../models/errMessage');
const EventMessager = require('./../../services/eventMessager');
const RpcMessage = require('./../../models/rpcMessage');

/**
 * [ClientGateway description]
 * @param  {JSON} options [description]
 * @constructor
 */
function ClientAmqpGateway(options) {
  this.amqpClient = new AmqpClient(options);
  this.eventMessager = new EventMessager(new EventEmitter(), this.amqpClient);
}

const C = ClientAmqpGateway.prototype;

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

/**
 * [description]
 * @param  {[type]} replyData [description]
 * @param  {[type]} request   [description]
 * @return {[type]}           [description]
 */
C.sendTableCreationReply = function sendTableCreationReply(replyData, request) {
  return new Promise((resolve, reject) => {
    const reply = replyData instanceof Error ?
      new ErrMessage('create-table-reply', replyData).toReply(request) :
      new RpcMessage('create-table-reply', replyData).toReply(request);
    this.amqpClient.sendAsync(reply, reply.replyTo).then(() => {
      resolve();
    }).catch((err) => {
      reject(err);
    });
  });
};

module.exports = ClientAmqpGateway;
