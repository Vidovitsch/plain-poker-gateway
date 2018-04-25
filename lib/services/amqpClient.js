const amqp = require('amqplib/callback_api');

/**
 * [AmqpClient description]
 * @param       {[type]} options [description]
 * @constructor
 */
function AmqpClient(options) {
    if (options.amqp) {
        this.host = options.amqp.host || '127.0.0.1';
        this.exchange = options.amqp.exchange || 'default';
        this.sharedConnection = null;
        this.sharedChannels = {};
    }
}

const A = AmqpClient.prototype;

/**
 * [description]
 * @param  {Message} message [description]
 * @param  {string} queue   [description]
 * @return {Promise}         [description]
 */
A.sendAsync = function(message, queue) {
    return new Promise((resolve, reject) => {
        // Create promises
        const connectionPromise = this.connectAsync();
        const channelPromise = connectionPromise.then((connection) => {
            return this.createChannelAsync(connection);
        });

        Promise.all([connectionPromise, channelPromise]).then(([connection, channel]) => {
            channel.assertExchange(this.exchange, 'direct', {durable: true});
            message.timestampBefore = new Date();
            channel.sendToQueue(queue, new Buffer(JSON.stringify(message)));
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
 * Sends a message with a given routingKey.
 * All queues bound to that routingKey will receive a message (fanout).
 *
 * @param  {Message} message    [description]
 * @param  {string} routingKey [description]
 * @return {Promise}            [description]
 */
A.fanoutAsync = function(message, routingKey) {
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
 * @param  {Function} callback    [description]
 */
A.listen = function(channel, queue, callback) {
    // Make sure the exchange exists
    channel.assertExchange(this.exchange, 'direct', {durable: true});
    // Make sure the queue exists
    this.assertQueueAsync(channel, queue, {autoDelete: true}).then((q) => {
        // Bind queue with exchange by means of a routingKey
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
A.rpcAsync = function(message, sendTo, replyTo) {
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
            const correlationId = message.correlationId;
            channel.consume(q.queue, (message) => {
                if (message.properties.correlationId === correlationId && message.content.isRpc) {
                    message.timestampAfter = new Date();
                    channel.ack(message);
                    setTimeout(() => {
                        connection.close();
                    }, 500);
                    resolve(JSON.parse(message.content.toString('utf8')));
                }
            });

            message.isRpc = true;
            message.replyTo = replyTo;
            message.timestampBefore = new Date();
            channel.sendToQueue(sendTo, new Buffer(JSON.stringify(message)));
        }).catch((err) => {
            reject(err);
        });
    });
};

A.connectAsync = function() {
    return new Promise((resolve, reject) => {
        amqp.connect(`amqp://${this.host}`, (err, connection) => {
            if (err) {
                reject(err);
            }
            resolve(connection);
        });
    });
};

A.createChannelAsync = function(connection) {
    return new Promise((resolve, reject) => {
        connection.createChannel((err, channel) => {
            if (err) {
                reject(err);
            }
            resolve(channel);
        });
    });
};

A.assertQueueAsync = function(channel, queue, options) {
    return new Promise((resolve, reject) => {
        channel.assertQueue(queue, options, (err, q) => {
            if (err) {
                reject(err);
            }
            resolve(q);
        });
    });
};

A.bindQueue = function(channel, queue, routingKey) {
    channel.bindQueue(queue, this.exchange, routingKey);
};

A.getSharedConnectionAsync = function() {
    return new Promise((resolve, reject) => {
        if (this.sharedConnection) {
            resolve(this.sharedConnection);
        }
        this.connectAsync().then((connection) => {
            this.sharedConnection = connection;
            resolve(this.sharedConnection);
        }).catch((err) => {
            reject(err);
        });
    });
};

A.getSharedChannelAsync = function(key) {
    return new Promise((resolve, reject) => {
        let sharedChannel = this.sharedChannels[key];
        if (sharedChannel) {
            resolve(sharedChannel);
        }
        this.getSharedConnection().then((sharedConnection) => {
            return this.createChannelAsync(sharedConnection);
        }).then((channel) => {
            this.sharedChannels[key] = channel;
            resolve(channel);
        }).catch((err) => {
            reject(err);
        });
    });
};

module.exports = AmqpClient;
