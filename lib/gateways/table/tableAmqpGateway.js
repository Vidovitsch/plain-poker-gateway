const { EventEmitter } = require('events');
const AmqpClient = require('./../../services/amqpClient');
const EventMessager = require('./../../services/eventMessager');
const RpcMessage = require('./../../models/rpcMessage');

/**
 * [TableGateway description]
 * @param  {Object} options [description]
 * @constructor
 */
function TableAmqpGateway(options) {
  this.amqpClient = new AmqpClient(options);
  this.eventMessager = new EventMessager(new EventEmitter(), this.amqpClient);
}

const T = TableAmqpGateway.prototype;

/**
 * [requestTableCreation description]
 * @param  {string} sessionId [description]
 * @param  {Object} data      [description]
 * @return {Promise}           [description]
 */
T.sendCreateTableRequest = function sendCreateTableRequest(sessionId, data) {
  const requestMessage = new RpcMessage('create-table-request', {
    sessionId,
    options: data,
  });
  return new Promise((resolve, reject) => {
    this.amqpClient.rpcAsync(requestMessage, 'table_default', `client_${sessionId}`).then((replyMessage) => {
      resolve(replyMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [onLobbyUpdate description]
 * @param  {Function} callback [description]
 */
T.onLobbyUpdate = function onLobbyUpdate(callback) {
  this.eventMessager.onEvent('lobby_update', 'lobby-update', (message) => {
    callback(message);
  });
};

module.exports = TableAmqpGateway;
