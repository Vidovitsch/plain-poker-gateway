const socket = require('socket.io');

const Receiver = require('../services/receiver');
const Sender = require('../services/receiver');

/**
 * [ClientGateway description]
 * @param       {[type]} options [description]
 * @constructor
 */
function ClientGateway(options) {
    this.options = options || {};
    if (options.websocket) {
        this.io = socket.listen(options.websocket.port);
    }
    if (options.amqp) {
        // TODO: implement option handlers
    }
}

// WebSocket communication //

ClientGateway.prototype.broadcastUpdate = async function(data) {
    this.io.emit('update-lobby', data);
}

ClientGateway.prototype.onClientConnected = function(callback) {
    this.io.on('connection', (client) => {
        callback(client);
    });
}

ClientGateway.prototype.onClientDisconnected = function(client) {
    return new Promise((resolve, reject) => {
        client.on('disconnect', () => {
            resolve(client);
        });
    });
}

ClientGateway.prototype.onLobbyRequest = function(client) {
    return new Promise((resolve, reject) => {
        client.on('request-lobby', (data) => {
            resolve(data);
        });
    });
};

ClientGateway.prototype.onCreateTable = function(client) {
    return new Promise((resolve, reject) => {
        client.on('create-table', (data) => {
            resolve(data);
        });
    });
};

ClientGateway.prototype.onRemoveTable = function(client) {
    return new Promise((resolve, reject) => {
        client.on('remove-table', (data) => {
            resolve(data);
        });
    });
};

ClientGateway.prototype.onUpdateTable = function(client) {
    return new Promise((resolve, reject) => {
        client.on('update-table', (data) => {
            resolve(data);
        });
    });
};

ClientGateway.prototype.onJoinTable = function(client) {
    return new Promise((resolve, reject) => {
        client.on('join-table', (data) => {
            resolve(data);
        });
    });
};

module.exports = ClientGateway;
