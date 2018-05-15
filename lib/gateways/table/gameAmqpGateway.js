const { EventEmitter } = require('events');
const EventMessager = require('./../../services/eventMessager');

/**
 * [ClientGateway description]
 * @param  {Object} options [description]
 * @constructor
 */
function GameAmqpGateway(amqpClient) {
  this.amqpClient = amqpClient;
  this.eventMessager = new EventMessager(new EventEmitter(), this.amqpClient);
}

const G = GameAmqpGateway.prototype;

module.exports = GameAmqpGateway;
