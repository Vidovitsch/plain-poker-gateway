const { EventEmitter } = require('events');
const EventMessager = require('./../../services/eventMessager');

/**
 * [ClientGateway description]
 * @param  {Object} options [description]
 * @constructor
 */
function DealerGameAmqpGateway(amqpClient) {
  this.amqpClient = amqpClient;
  this.eventMessager = new EventMessager(new EventEmitter(), this.amqpClient);
}

const D = DealerGameAmqpGateway.prototype;

module.exports = DealerGameAmqpGateway;
