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
 * [description]
 * @param  {[type]}   queue    [description]
 * @param  {[type]}   context  [description]
 * @param  {Function} callback [description]
 */
E.onEvent = function onEvent(queue, context, channelKey, callback) {
  if (this.amqpClient.isListening(queue, channelKey)) {
    const sharedChannel = this.amqpClient.getSharedChannel(channelKey);
    this.amqpClient.bindQueue(sharedChannel, queue, context);
  } else {
    const channel = this.amqpClient.setListener(queue, channelKey);
    if (channel instanceof Error) {
      callback(channel);
    } else {
      this.amqpClient.listen(channel, queue, (message) => {
        this.eventEmitter.emit(message.context, message);
      });
      this.amqpClient.bindQueue(channel, queue, context);
    }
  }
  this.eventEmitter.on(context, (message) => {
    callback(null, message);
  });
};

module.exports = EventMessager;
