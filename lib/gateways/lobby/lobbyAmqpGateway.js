const AmqpClient = require('./../../services/amqpClient');
const { EventEmitter } = require('events');
const Message = require('./../../models/rpcMessage');
const EventMessager = require('./../../services/eventMessager');

/**
 * [LobbyGateway description]
 * @param       {[type]} options [description]
 * @constructor
 */
function LobbyAmqpGateway(options) {
  this.options = options || {};
  if (options.amqp) {
    this.amqpClient = new AmqpClient(options);
    this.eventMessager = new EventMessager(new EventEmitter(), this.amqpClient);
  }
}

const L = LobbyAmqpGateway.prototype;

L.sendLobbyUpdate = function sendLobbyUpdate(table) {
  return new Promise((resolve, reject) => {
    const message = new Message('update-lobby', table);
    this.amqpClient.sendAsync(message, 'lobby_update').then(() => {
      resolve();
    }).catch((err) => {
      reject(err);
    });
  });
};

module.exports = LobbyAmqpGateway;
