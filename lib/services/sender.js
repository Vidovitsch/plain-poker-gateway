const amqp = require('amqplib/callback_api');
const util = require('util');

/**
 * [Sender description]
 * @constructor
 */
function Sender(options) {
    if (options.amqp) {
        this.host = options.amqp.host;
        this.exchange = options.amqp.exchange || 'plain-poker-main';
        amqp.connect(util.format('amqp://%s', options.amqp.host), (err, conn) => {
            if (err) {
                throw err;
            }
            this.connecion = conn;
        });
    }
}

Sender.prototype.connect = async function() {
    return new Promise((resolve, reject) => {
        if (this.host) {
            amqp.connect(util.format('amqp://%s', this.host), (err, conn) => {
                if (err) {
                    reject(err);
                }
                conn.on('error', (err) => {
                    console.log(err);
                });
                conn.on('close', () => {
                    console.log('connection closed');
                });
                this.connection = conn;
                resolve();
            });
        } else {
            reject('host is undefined');
        }
    });
};

Sender.prototype.createChannel = async function() {
    return new Promise((resolve, reject) => {
        if (this.connection) {
            return this.connection.createConfirmChannel((err, ch) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(ch);
                }
            });
        } else {
            reject('connection is undefined');
        }
    });
};

Sender.prototype.send = async function(data, routingKey, ch) {
    if (ch) {
        ch.assertExchange(this.exchange, 'direct', {durable: false});
        ch.publish(this.exchange, routingKey, JSON.stringify(data));
    }
};

module.exports = Sender;
