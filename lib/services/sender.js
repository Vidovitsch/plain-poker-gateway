const amqp = require('amqplib/callback_api');
const util = require('util');

/**
 * [Sender description]
 * @param       {[type]} options [description]
 * @constructor
 */
function Sender(options) {
    if (options.amqp) {
        this.host = options.amqp.host;
        this.exchange = options.amqp.exchange || 'default';
    }
}

Sender.prototype.send = async function(message) {
    return new Promise((resolve, reject) => {
        this.connect().then((connection) => {
            console.log('1');
            return this.createChannel(connection);
        }).then((channel, connection) => {
            console.log('2');
            // Make sure the queue exists
            channel.assertExchange(this.exchange, 'direct', {durable: true});
            message.timestampBefore = new Date();
            channel.publish(this.exchange, message.context, JSON.stringify(message));

            // Following the principal of 'post and forget' to save resources
            connection.close();
            resolve();
        }).catch((err) => {
            console.log('3');
            reject(err);
        });
    });
};

Sender.prototype.connect = async function() {
    return new Promise((resolve, reject) => {
        if (this.host) {
            amqp.connect(util.format('amqp://%s', this.host), (err, connection) => {
                if (err) {
                    reject(err);
                }
                resolve(connection);
            });
        } else {
            reject('host is undefined');
        }
    });
};

Sender.prototype.createChannel = async function(connection) {
    return new Promise((resolve, reject) => {
        if (connection) {
            return connection.createChannel((err, channel) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(channel, connection);
                }
            });
        } else {
            reject('connection is undefined');
        }
    });
};

module.exports = Sender;
