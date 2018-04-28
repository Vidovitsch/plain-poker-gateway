const AmqpClient = require('../services/amqpClient');
const { EventEmitter } = require('events');
const EventMessager = require('./../services/eventMessager');

/**
 * [DealerGateway description]
 * @param       {[type]} options [description]
 * @constructor
 */
function DealerGateway(options) {
  this.options = options || {};
  if (options.amqp) {
    this.amqpClient = new AmqpClient(options);
    const eventEmitter = new EventEmitter();
    this.eventMessager = new EventMessager(eventEmitter, this.amqpClient);
  }
}

module.exports = DealerGateway;
