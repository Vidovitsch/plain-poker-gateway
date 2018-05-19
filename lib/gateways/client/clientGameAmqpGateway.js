const { EventEmitter } = require('events');
const EventMessager = require('./../../services/eventMessager');

// Singleton support
let instance = null;

/**
 * [ClientGameAmqpGateway description]
 * @param       {AmqpClient} amqpClient [description]
 * @constructor
 */
function ClientGameAmqpGateway(amqpClient) {
  this.amqpClient = amqpClient;
  this.eventMessager = EventMessager.createInstance(new EventEmitter(), this.amqpClient);
}

module.exports = {
  /**
   * [getInstance description]
   * @param  {AmqpClient} amqpClient [description]
   * @return {ClientGameAmqpGateway}            [description]
   * @return {Error}            [description]
   */
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
