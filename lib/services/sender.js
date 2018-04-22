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

Sender.prototype.send = async function(routingKey, data) {
    return new Promise((resolve, reject) => {
        this.connect().then((conn) => {
            return this.createChannel(conn);
        }).then((ch, conn) => {
            ch.assertExchange(this.exchange, 'direct', {durable: false});
            ch.publish(this.exchange, routingKey, JSON.stringify(data));
            conn.close();
            resolve();
        }).catch((err) => {
            reject(err);
        });
    });
};

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
                resolve(conn);
            });
        } else {
            reject('host is undefined');
        }
    });
};

Sender.prototype.createChannel = async function(conn) {
    return new Promise((resolve, reject) => {
        if (conn) {
            return conn.createChannel((err, ch) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(ch, conn);
                }
            });
        } else {
            reject('connection is undefined');
        }
    });
};

module.exports = Sender;
