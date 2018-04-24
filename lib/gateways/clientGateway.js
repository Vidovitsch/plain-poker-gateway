const socket = require('socket.io');
const AmqpClient = require('../services/amqpClient');

/**
 * [ClientGateway description]
 * @param       {[type]} options [description]
 * @constructor
 */
function ClientGateway(options) {
    if (options.websocket) {
        this.io = socket.listen(options.websocket.port);
    }
    this.amqpClient = new AmqpClient(options);
    this.connection = null;
}

ClientGateway.prototype.listenToTableDefault = function(callback) {
    this.checkConnectionForListeners().then(() => {
        return this.amqpClient.createChannelAsync(this.connection);
    }).then((channel) => {
        const queue = 'table_default';
        const routingKeys = ['create-table-request', 'remove-table-request', 'update-table-request', 'join-table-request'];
        this.amqpClient.listen(channel, queue, routingKeys, (err, message) => {
            if (err) {
                callback(err);
            } else {
                callback(null, message);
            }
        });
    }).catch((err) => {
        callback(err);
    });
};

ClientGateway.prototype.onGameMessage = function(cb) {
    // // TODO:
};

// WebSocket communication //

ClientGateway.prototype.replyLobby = async function(data) {
    this.io.emit('lobby-reply', JSON.stringify(data));
};

ClientGateway.prototype.broadcastUpdate = async function(data) {
    this.io.emit('update-lobby', JSON.stringify(data));
};

ClientGateway.prototype.onClientConnected = function(cb) {
    this.io.on('connection', (client) => {
        cb(client);
    });
};

ClientGateway.prototype.onClientDisconnected = function(client, cb) {
    client.on('disconnect', () => {
        cb();
    });
};

ClientGateway.prototype.onLobbyRequest = function(client, callback) {
    client.on('lobby-request', () => {
        callback();
    });
};

ClientGateway.prototype.checkConnectionForListeners = function() {
    return new Promise((resolve, reject) => {
        if (!this.connection) {
            this.amqpClient.connectAsync().then((connection) => {
                this.connection = connection;
                resolve();
            }).catch((err) => {
                reject(err);
            });
        } else {
            resolve();
        }
    });
};

module.exports = ClientGateway;
