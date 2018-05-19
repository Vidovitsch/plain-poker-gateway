/**
 * [EventMessager description]
 * @param       {[type]} eventEmitter [description]
 * @param       {[type]} amqpClient   [description]
 * @constructor
 */
function EventMessager(eventEmitter, amqpClient) {
  this.eventEmitter = eventEmitter;
  this.amqpClient = amqpClient;
}

const E = EventMessager.prototype;

/**
 * [onEvent description]
 * @param  {[type]}   queue      [description]
 * @param  {[type]}   context    [description]
 * @param  {[type]}   channelKey [description]
 * @param  {Function} callback   [description]
 * @return {[type]}              [description]
 */
E.onEvent = function onEvent(args, callback) {
  if (this.amqpClient.isListening(args.queue, args.channelKey)) {
    const sharedChannel = this.amqpClient.getSharedChannel(args.channelKey);
    this.amqpClient.bindQueue(sharedChannel, args.queue, args.context);
  } else {
    const channel = this.amqpClient.setListener(args.queue, args.channelKey);
    if (channel instanceof Error) {
      callback(channel);
    } else {
      this.amqpClient.listen(channel, args.queue, (message) => {
        this.eventEmitter.emit(message.context, message);
      });
      this.amqpClient.bindQueue(channel, args.queue, args.context);
    }
  }
  this.eventEmitter.on(args.context, (message) => {
    callback(null, message);
  });
};

module.exports = EventMessager;
