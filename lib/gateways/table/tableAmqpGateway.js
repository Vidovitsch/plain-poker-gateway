const { EventEmitter } = require('events');
const AmqpClient = require('./../../services/amqpClient');
const EventMessager = require('./../../services/eventMessager');
const RpcMessage = require('./../../models/rpcMessage');

/**
 * [TableGateway description]
 * @param       {[type]} options [description]
 * @constructor
 */
function TableAmqpGateway(options) {
  this.amqpClient = new AmqpClient(options);
  this.eventMessager = new EventMessager(new EventEmitter(), this.amqpClient);
}

const T = TableAmqpGateway.prototype;

T.requestTableCreation = function requestTableCreation(sessionId, options) {
  return new Promise((resolve, reject) => {
    const message = new RpcMessage('create-table-request', options);
    this.amqpClient.rpcAsync(message, 'table_default', `client_${sessionId}`).then((reply) => {
      resolve(reply);
    }).catch((err) => {
      reject(err);
    });
  });
};

T.requestTableRemoval = function requestTableRemoval(sessionId, options) {
  return new Promise((resolve, reject) => {
    const message = new RpcMessage('remove-table-request', options);
    this.amqpClient.rpcAsync(message, 'table_default', `client_${sessionId}`).then((reply) => {
      resolve(reply);
    }).catch((err) => {
      reject(err);
    });
  });
};

T.requestTableUpdate = function requestTableUpdate(sessionId, options) {
  return new Promise((resolve, reject) => {
    const message = new RpcMessage('update-table-request', options);
    this.amqpClient.rpcAsync(message, 'table_default', `client_${sessionId}`).then((reply) => {
      resolve(reply);
    }).catch((err) => {
      reject(err);
    });
  });
};

T.requestTableJoin = function requestTableJoin(sessionId, options) {
  return new Promise((resolve, reject) => {
    const message = new RpcMessage('join-table-request', options);
    this.amqpClient.rpcAsync(message, 'table_default', `client_${sessionId}`).then((reply) => {
      resolve(reply);
    }).catch((err) => {
      reject(err);
    });
  });
};

T.onLobbyUpdate = function onLobbyUpdate(callback) {
  this.eventMessager.onEvent('lobby_update', 'update-lobby', (request) => {
    callback(request);
  });
};

module.exports = TableAmqpGateway;
