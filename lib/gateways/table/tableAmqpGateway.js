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
T.requestTableCreation = function requestTableCreation(sessionId, data) {
  const request = new RpcMessage('create-table-request', data);
  return new Promise((resolve, reject) => {
    this.amqpClient.rpcAsync(request, 'table_default', `client_${sessionId}`).then((reply) => {
      resolve(reply);
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
  this.eventMessager.onEvent('lobby_update', 'update-lobby', (message) => {
    callback(message);
  });
};

module.exports = TableAmqpGateway;
