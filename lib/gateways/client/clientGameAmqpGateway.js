const { EventEmitter } = require('events');
const EventMessager = require('./../../services/eventMessager');

// Singleton support
let instance = null;

/**
 * [ClientGateway description]
 * @param  {Object} options [description]
 * @constructor
 */
function ClientGameAmqpGateway(amqpClient) {
  this.amqpClient = amqpClient;
  this.eventMessager = new EventMessager(new EventEmitter(), this.amqpClient);
}

module.exports = {
  getInstance(amqpClient) {
    if (!instance) {
      if (!amqpClient) {
        throw new Error('Invalid argument(s)');
      }
      instance = new ClientGameAmqpGateway(amqpClient);
    }
    return instance;
  },
};
