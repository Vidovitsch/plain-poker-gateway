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
C.sendCreateTableReply = function sendCreateTableReply(replyData, requestMessage) {
  const context = 'create-table-reply';
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

/**
 * [description]
 * @param  {Function} callback [description]
 */
C.onCreateTableRequest = function onCreateTableRequest(callback) {
  this.eventMessager.onEvent('table_default', 'create-table-request', (requestMessage) => {
    callback(requestMessage);
  });
};

module.exports = ClientAmqpGateway;
