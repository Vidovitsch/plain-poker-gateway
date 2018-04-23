const amqp = require('amqplib/callback_api');
const util = require('util');

/**
 * [Sender description]
 * @param       {[type]} options [description]
 * @constructor
 */
function Sender(options) {
    if (options.amqp) {
        this.host = options.amqp.host || '127.0.0.1';
        this.exchange = options.amqp.exchange || 'default';
    }
}

Sender.prototype.send = async function(message) {
    return new Promise((resolve, reject) => {
        if (this.host) {
            amqp.connect(util.format('amqp://%s', this.host), (err, connection) => {
                if (err) {
                    reject(err);
                }
                connection.createChannel((err, channel) => {
                    if (err) {
                        reject(err);
                    } else {
                        channel.assertExchange(this.exchange, 'direct', {durable: true});
                        message.timestampBefore = new Date();
                        channel.publish(this.exchange, message.context, new Buffer(JSON.stringify(message)));

                        // Asynchronously close connection after 500ms to save resources.
                        setTimeout(() => {
                            connection.close();
                        }, 500);
                        resolve();
                    }
                });
            });
        } else {
            reject(new Error('host is undefined'));
        }
    });
};

module.exports = Sender;
