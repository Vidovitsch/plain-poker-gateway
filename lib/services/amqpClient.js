const amqp = require('amqplib/callback_api');
const uuidv4 = require('uuid/v4');

/**
 * [AmqpClient description]
 * @param       {[type]} options [description]
 * @constructor
 */
function AmqpClient(options) {
    if (options.amqp) {
        this.host = options.amqp.host || '127.0.0.1';
        this.exchange = options.amqp.exchange || 'default';
    }
}

/**
 * Sends a message with a given routingKey.
 * All queues bound to that routingKey will receive a message.
 *
 * @param  {Message} message    [description]
 * @param  {string} routingKey [description]
 * @return {Promise}            [description]
 */
AmqpClient.prototype.sendAsync = function(message, routingKey) {
    return new Promise((resolve, reject) => {
        // Create promises
        const connectionPromise = this.connectAsync();
        const channelPromise = connectionPromise.then((connection) => {
            return this.createChannelAsync(connection);
        });

        Promise.all([connectionPromise, channelPromise]).then(([connection, channel]) => {
            channel.assertExchange(this.exchange, 'direct', {durable: true});
            message.timestampBefore = new Date();
            channel.publish(this.exchange, routingKey, new Buffer(JSON.stringify(message)));
            setTimeout(() => {
                connection.close();
            }, 500);
            resolve();
        }).catch((err) => {
            reject(err);
        });
    });
};

/**
 * Listens continuously to a specific queue.
 *
 * @param  {Channel}   channel     [description]
 * @param  {string}   queue       [description]
 * @param  {string}   routingKeys [description]
 * @param  {Function} callback    [description]
 */
AmqpClient.prototype.listen = function(channel, queue, routingKeys, callback) {
    // Make sure the exchange exists
    channel.assertExchange(this.exchange, 'direct', {durable: true});
    // Make sure the queue exists
    this.assertQueueAsync(channel, queue, {autoDelete: true}).then((q) => {
        // Bind queue with exchange by means of a routingKey
        if (routingKeys) {
            routingKeys.forEach((routingKey) => {
                channel.bindQueue(q.queue, this.exchange, routingKey);
            });
        }
        channel.consume(q.queue, (message) => {
            if (!message.content.isRpc) {
                // Let RabbitMQ know the message has been received successfully
                channel.ack(message);
                message = JSON.parse(message.content.toString('utf8'));
                message.timestampAfter = new Date();
                callback(null, message);
            }
        });
    }).catch((err) => {
        callback(err);
    });
};

/**
 * Sends a message to a queue and expects a reply to that message.
 * This function support request/reply patterns.
 *
 * @param  {Message} message [description]
 * @param  {string} sendTo  [description]
 * @param  {string} replyTo [description]
 * @return {Promise}         [description]
 */
AmqpClient.prototype.rpc = function(message, sendTo, replyTo) {
    return new Promise((resolve, reject) => {
        // Create promises
        const connectionPromise = this.connectAsync();
        const channelPromise = connectionPromise.then((connection) => {
            return this.createChannelAsync(connection);
        });
        const queuePromise = channelPromise.then((channel) => {
            return this.assertQueueAsync(channel, replyTo, {autoDelete: true});
        });

        // Wait till all promises are met
        Promise.all([connectionPromise, channelPromise, queuePromise]).then(([connection, channel, q]) => {
            const correlationId = uuidv4();
            channel.consume(q.queue, (message) => {
                if (message.properties.correlationId === correlationId && message.content.isRpc) {
                    channel.ack(message);
                    setTimeout(() => {
                        connection.close();
                    }, 500);
                    resolve(JSON.parse(message.content.toString('utf8')));
                }
            });

            message.isRpc = true;
            channel.sendToQueue(sendTo, new Buffer(JSON.stringify(message)), {
                correlationId: correlationId,
                replyTo: replyTo,
            });
        }).catch((err) => {
            reject(err);
        });
    });
};

AmqpClient.prototype.connectAsync = function() {
    return new Promise((resolve, reject) => {
        amqp.connect(`amqp://${this.host}`, (err, connection) => {
            if (err) {
                reject(err);
            }
            resolve(connection);
        });
    });
};

AmqpClient.prototype.createChannelAsync = function(connection) {
    return new Promise((resolve, reject) => {
        connection.createChannel((err, channel) => {
            if (err) {
                reject(err);
            }
            resolve(channel);
        });
    });
};

AmqpClient.prototype.assertQueueAsync = function(channel, queue, options) {
    return new Promise((resolve, reject) => {
        channel.assertQueue(queue, options, (err, q) => {
            if (err) {
                reject(err);
            }
            resolve(q);
        });
    });
};

module.exports = AmqpClient;
