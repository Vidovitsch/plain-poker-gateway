const amqp = require('amqplib/callback_api');
const util = require('util');

/**
 * [Receiver description]
 * @param       {[type]} options [description]
 * @constructor
 */
function Receiver(options) {
    if (options.amqp) {
        this.host = options.amqp.host;
        this.exchange = options.amqp.exchange || 'default';
    }
}

Receiver.prototype.receiveOnce = function(queue, routingKey) {
    return new Promise((resolve, reject) => {
        this.connect().then((conn) => {
            this.createChannel(conn);
        }).then((ch, conn) => {
            ch.assertExchange(this.exchange, 'direct', {durable: false});
            ch.assertQueue(queue, {exclusive: true}, (err, q) => {
                if (err) {
                    conn.close();
                    reject(err);
                } else {
                    ch.bindQueue(q.queue, this.exchange, routingKey);
                    ch.consume(q.queue, (data) => {
                        resolve(data);
                        conn.close();
                    });
                }
            });
        }).catch((err) => {
            // Connection already closed
            reject(err);
        });
    });
};

Receiver.prototype.startReceiving = function(queue, routingKey, cb) {
    this.connect().then((conn) => {
        this.createChannel(conn);
    }).then((ch, conn) => {
        ch.assertExchange(this.exchange, 'direct', {durable: false});
        ch.assertQueue(queue, {exclusive: true}, (err, q) => {
            if (err) {
                conn.close();
                cb(err);
            } else {
                ch.bindQueue(q.queue, this.exchange, routingKey);
                ch.consume(q.queue, (data) => {
                    cb(null, data, conn);
                });
            }
        });
    }).catch((err) => {
        // Connection already closed
        cb(err);
    });
};

Receiver.prototype.connect = async function() {
    return new Promise((resolve, reject) => {
        if (this.host) {
            amqp.connect(util.format('amqp://%s', this.host), (err, conn) => {
                if (err) {
                    conn.close();
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

Receiver.prototype.createChannel = async function(conn) {
    return new Promise((resolve, reject) => {
        if (conn) {
            return conn.createChannel((err, ch) => {
                if (err) {
                    conn.close();
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

module.exports = Receiver;
