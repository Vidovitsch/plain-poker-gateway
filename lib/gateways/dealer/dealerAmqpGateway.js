const { EventEmitter } = require('events');
const AmqpClient = require('./../../services/amqpClient');
const EventMessager = require('./../../services/eventMessager');

/**
 * [DealerGateway description]
 * @param       {[type]} options [description]
 * @constructor
 */
function DealerAmqpGateway(options) {
  this.amqpClient = new AmqpClient(options);
  this.eventMessager = new EventMessager(new EventEmitter(), this.amqpClient);
}

module.exports = DealerAmqpGateway;
