const amqp = require('amqplib/callback_api');
const util = require('util');

/**
 * [Receiver description]
 * @param       {[type]} options [description]
 * @constructor
 */
function Receiver(options) {
    if (options.amqp) {
        this.host = options.amqp.host || '127.0.0.1';
        this.exchange = options.amqp.exchange || 'default';

        // Connection for all consuming is shared
        this.connection = null;
    }
}

Receiver.prototype.startReceiving = function(channel, queue, routingKeys, callback) {
    if (channel) {
        // Make sure the exchange exists
        channel.assertExchange(this.exchange, 'direct', {durable: true});
        // Make sure the queue exists
        channel.assertQueue(queue, {durable: true}, (err, q) => {
            if (err) {
                callback(err);
            } else {
                // Bind queue with exchange by means of a routingKey
                if (routingKeys) {
                    routingKeys.forEach((routingKey) => {
                        channel.bindQueue(q.queue, this.exchange, routingKey);
                    });
                }
                channel.consume(q.queue, (message) => {
                    message = JSON.parse(message.toString('utf8'));
                    message.timestampAfter = new Date();
                    callback(null, message);
                });
            }
        });
    }
};

Receiver.prototype.connect = async function() {
    return new Promise((resolve, reject) => {
        if (this.connection) {
            reject('already connected');
        }
        if (this.host) {
            amqp.connect(util.format('amqp://%s', this.host), (err, connection) => {
                if (err) {
                    connection.close();
                    reject(err);
                }
                this.connection = connection;
                resolve(connection);
            });
        } else {
            reject('host is undefined');
        }
    });
};

Receiver.prototype.reConnect = async function() {
    return new Promise((resolve, reject) => {
        if (this.connection) {
            this.connection.close();
            this.connect().then((connection) => {
                resolve(connection);
            }).catch((err) => {
                reject(err);
            });
        } else {
            reject('no connection');
        }
    });
};

Receiver.prototype.createChannel = async function() {
    return new Promise((resolve, reject) => {
        if (this.connection) {
            return this.connection.createChannel((err, channel) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(channel);
                }
            });
        } else {
            reject('connection is undefined');
        }
    });
};

Receiver.prototype.closeConnection = function() {
    if (this.connection) {
        this.connection.close();
    }
};

Receiver.prototype.closeChannel = function(channel) {
    if (channel) {
        channel.close();
    }
};

module.exports = Receiver;
