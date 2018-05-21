const { EventEmitter } = require('events');
const EventMessager = require('./../../services/eventMessager');
const Message = require('./../../models/message');

/**
 * [LobbyAmqpGateway description]
 * @param       {AmqpClient} amqpClient [description]
 * @constructor
 */
function LobbyAmqpGateway(amqpClient) {
  this.amqpClient = amqpClient;
  this.eventMessager = EventMessager.createInstance(new EventEmitter(), this.amqpClient);
}

const L = LobbyAmqpGateway.prototype;

/**
 * [sendLobbyUpdateAsync description]
 * @param  {Object} data [description]
 * @return {Promise}      [description]
 */
L.sendLobbyUpdateAsync = function sendLobbyUpdateAsync(action, tableItem) {
  return new Promise((resolve, reject) => {
    const message = new Message('lobby-update', {
      action,
      tableItem,
    });
    this.amqpClient.sendAsync(message, 'lobby_update').then(() => {
      resolve(message);
    }).catch((err) => {
      reject(err);
    });
  });
};

module.exports = {
  /**
   * [getInstance description]
   * @param  {AmqpClient} amqpClient [description]
   * @return {LobbyAmqpGateway}            [description]
   * @return {Error}            [description]
   */
  createInstance(amqpClient) {
    if (!amqpClient) {
      throw new Error('Invalid argument(s)');
    }
    return new LobbyAmqpGateway(amqpClient);
  },
};
