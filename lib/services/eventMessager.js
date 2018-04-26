
/**
 * [EventMessage description]
 * @param       {[type]} amqpClient [description]
 * @constructor
 */
function EventMessager(amqpClient) {
    this.amqpClient = amqpClient;
}

const E = EventMessager.prototype;

/**
 * [description]
 * @param  {string}   queue        [description]
 * @param  {string}   context      [description]
 * @param  {EventEmitter}   eventEmitter [description]
 * @param  {Function} callback     [description]
 */
E.onEvent = function(queue, context, eventEmitter, callback) {
    this.amqpClient.getSharedChannelAsync(queue).then((channel) => {
        // Initialize listener if it doesn't exist for given queue
        this.initEventListener(channel, queue, eventEmitter);

        this.amqpClient.bindQueue(channel, queue, context);
        eventEmitter.on(context, (request) => {
            callback(request);
        });
    });
};

/**
 * [description]
 * @param  {Channel} channel      [description]
 * @param  {string} queue        [description]
 * @param  {EventEmitter} eventEmitter [description]
 */
E.initEventListener = function(channel, queue, eventEmitter) {
    if (!this.amqpClient.isListening(queue)) {
        this.amqpClient.listen(channel, queue, (err, message) => {
            eventEmitter.emit(message.context, message);
        });
    }
};

module.exports = EventMessager;
