const { EventEmitter } = require('events');
const AmqpClient = require('./../../services/amqpClient');
const EventMessager = require('./../../services/eventMessager');
const Message = require('./../../models/rpcMessage');

/**
 * [LobbyGateway description]
 * @param  {Object} options [description]
 * @constructor
 */
function LobbyAmqpGateway(options) {
  this.amqpClient = new AmqpClient(options);
  this.eventMessager = new EventMessager(new EventEmitter(), this.amqpClient);
}

const L = LobbyAmqpGateway.prototype;

/**
 * [sendLobbyUpdate description]
 * @param  {Object} data [description]
 * @return {Promise}      [description]
 */
L.sendLobbyUpdate = function sendLobbyUpdate(data) {
  const message = new Message('lobby-update', data);
  return new Promise((resolve, reject) => {
    this.amqpClient.sendAsync(message, 'lobby_update').then(() => {
      resolve();
    }).catch((err) => {
      reject(err);
    });
  });
};

module.exports = LobbyAmqpGateway;
