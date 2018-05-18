const { EventEmitter } = require('events');
const EventMessager = require('./../../services/eventMessager');
const Message = require('./../../models/message');

/**
 * [LobbyGateway description]
 * @param  {Object} options [description]
 * @constructor
 */
function LobbyAmqpGateway(amqpClient) {
  this.amqpClient = amqpClient;
  this.eventMessager = new EventMessager(new EventEmitter(), this.amqpClient);
}

const L = LobbyAmqpGateway.prototype;

/**
 * [sendLobbyUpdate description]
 * @param  {Object} data [description]
 * @return {Promise}      [description]
 */
L.sendLobbyUpdateAsync = function sendLobbyUpdateAsync(data) {
  const message = new Message('lobby-update', data);
  return new Promise((resolve, reject) => {
    this.amqpClient.sendAsync(message, 'lobby_update').then(() => {
      resolve(message);
    }).catch((err) => {
      reject(err);
    });
  });
};

module.exports = LobbyAmqpGateway;
