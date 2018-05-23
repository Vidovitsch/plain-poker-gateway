/**
 * [EventMessager description]
 * @param       {EventEmitter} eventEmitter [description]
 * @param       {AmqpClient} amqpClient   [description]
 * @constructor
 */
function EventMessager(eventEmitter, amqpClient) {
  this.eventEmitter = eventEmitter;
  this.amqpClient = amqpClient;
  this.callbacks = {};
}

const E = EventMessager.prototype;

/**
 * [onEvent description]
 * @param  {String}   queue      [description]
 * @param  {String}   context    [description]
 * @param  {String}   channelKey [description]
 * @param  {Function} callback   [description]
 */
E.onEvent = function onEvent(args, callback) {
  this.callbacks[args.context] = callback;
  if (!this.amqpClient.isListening(args.queue, args.channelKey)) {
    const channel = this.amqpClient.setListener(args.queue, args.channelKey);
    if (channel instanceof Error) {
      callback(channel);
    } else {
      this.amqpClient.listen({
        channel,
        queue: args.queue,
        routingKey: args.routingKey,
      }, (message) => {
        this.callbacks[message.context](null, message);
      });
    }
  }
};

module.exports = {
  /**
   * [createInstance description]
   * @param  {EventEmitter} eventEmitter [description]
   * @param  {AmqpClient} amqpClient   [description]
   * @return {EventMessager}              [description]
   * @return {Error}              [description]
   */
  createInstance(eventEmitter, amqpClient) {
    if (!eventEmitter || !amqpClient) {
      return new Error('Invalid argument(s)');
    }
    return new EventMessager(eventEmitter, amqpClient);
  },
};
