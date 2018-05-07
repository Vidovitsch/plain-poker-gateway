const { EventEmitter } = require('events');
const EventMessager = require('./../../services/eventMessager');

/**
 * [DealerGateway description]
 * @param  {Object} options [description]
 * @constructor
 */
function DealerAmqpGateway(amqpClient) {
  this.amqpClient = amqpClient;
  this.eventMessager = new EventMessager(new EventEmitter(), this.amqpClient);
}

module.exports = DealerAmqpGateway;
