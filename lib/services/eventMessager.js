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
  this.amqpClient.createSharedChannelAsync(channelKey).then((channel) => {
    // Initialize listener if it doesn't exist for given queue
    this.initListener(channel, queue);

    this.amqpClient.bindQueue(channel, queue, context);
    this.eventEmitter.on(context, (message) => {
      callback(null, message);
    });
  }).catch((err) => {
    callback(err);
  });
};

/**
 * [description]
 * @param  {Channel} channel      [description]
 * @param  {string} queue        [description]
 * @param  {EventEmitter} eventEmitter [description]
 */
E.initListener = function initListener(channel, queue) {
  if (!this.amqpClient.isListening(queue)) {
    this.amqpClient.listen(channel, queue, (message) => {
      this.eventEmitter.emit(message.context, message);
    });
  }
};

module.exports = EventMessager;
