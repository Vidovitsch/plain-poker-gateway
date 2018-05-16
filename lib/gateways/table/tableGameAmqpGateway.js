const { EventEmitter } = require('events');
const EventMessager = require('./../../services/eventMessager');

/**
 * [ClientGateway description]
 * @param  {Object} options [description]
 * @constructor
 */
function TableGameAmqpGateway(amqpClient) {
  this.amqpClient = amqpClient;
  this.eventMessager = new EventMessager(new EventEmitter(), this.amqpClient);
}

const T = TableGameAmqpGateway.prototype;

module.exports = TableGameAmqpGateway;
