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
        this.connections = {};
    }
}

Receiver.prototype.startReceiving = function(queue, cb) {
    this.connect().then((conn) => {
        return this.createChannel(conn);
    }).then((ch, conn) => {
        this.channel = ch;
        ch.assertExchange(this.exchange, 'direct', {durable: false});
        ch.assertQueue(queue, {exclusive: true}, (err, q) => {
            if (err) {
                conn.close();
                cb(err);
            } else {
                if (!this.connections[q.queue]) {
                    this.connections[q.queue] = {
                        connection: conn,
                        channel: ch,
                    };
                }
                ch.consume(q.queue, (message) => {
                    message.timestampAfter = new Date();
                    cb(null, message);
                });
            }
        });
    }).catch((err) => {
        // Connection already closed
        cb(err);
    });
};

Receiver.prototype.bindQueue = function(queue, routingKey) {
    this.connections[queue]['channel'].bindQueue(queue, this.exchange, routingKey);
};

Receiver.prototype.closeConnection = function(queue) {
    this.connections[queue]['connection'].close();
    delete this.connections[queue];
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
