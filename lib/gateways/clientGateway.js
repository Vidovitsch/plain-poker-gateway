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
    this.sharedConnection = null;
}

ClientGateway.prototype.listenToTableQueue= function(callback) {
    // Listeners share the same connection for resource efficiency
    this.getSharedConnection().then((connection) => {
        return this.amqpClient.createChannelAsync(connection);
    }).then((channel) => {
        const queue = 'table_default';
        this.amqpClient.listen(channel, queue, (err, message) => {
            if (err) {
                callback(err);
            } else {
                callback(null, channel);
            }
        });
    }).catch((err) => {
        callback(err);
    });
};

ClientGateway.prototype.onTableCreationRequest = function(channel, callback) {
    const queue = 'create-table-request';
};

ClientGateway.prototype.onTableRemovalRequest = function(channel, callback) {
    const queue = 'table_default';
};

ClientGateway.prototype.onTableUpdateRequest = function(channel, callback) {
    const queue = 'table_default';
};

ClientGateway.prototype.onTableJoinRequest = function(channel, callback) {
    const queue = 'table_default';
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

ClientGateway.prototype.getSharedConnection = function() {
    return new Promise((resolve, reject) => {
        if (!this.sharedConnection) {
            this.amqpClient.connectAsync().then((connection) => {
                this.sharedConnection = connection;
                resolve(connection);
            }).catch((err) => {
                reject(err);
            });
        } else {
            resolve(this.sharedConnection);
        }
    });
};

module.exports = ClientGateway;
