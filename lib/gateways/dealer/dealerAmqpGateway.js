const AmqpClient = require('./../../services/amqpClient');
const { EventEmitter } = require('events');
const EventMessager = require('./../../services/eventMessager');

/**
 * [DealerGateway description]
 * @param       {[type]} options [description]
 * @constructor
 */
function DealerAmqpGateway(options) {
  this.options = options || {};
  if (options.amqp) {
    this.amqpClient = new AmqpClient(options);
    this.eventMessager = new EventMessager(new EventEmitter(), this.amqpClient);
  }
}

module.exports = DealerAmqpGateway;
