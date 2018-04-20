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

ClientGateway.prototype.replyLobby = async function(data) {
    this.io.emit('reply-lobby', data);
}

ClientGateway.prototype.broadcastUpdate = async function(data) {
    this.io.emit('update-lobby', data);
}

ClientGateway.prototype.onClientConnected = function(cb) {
    this.io.on('connection', (client) => {
        cb(client);
    });
}

ClientGateway.prototype.onClientDisconnected = function(client, cb) {
    client.on('disconnect', () => {
        cb(client);
    });
}

ClientGateway.prototype.onLobbyRequest = function(client, cb) {
    client.on('request-lobby', (data) => {
        cb(data);
    });
};

ClientGateway.prototype.onCreateTable = function(client, cb) {
    client.on('create-table', (data) => {
        cb(data);
    });
};

ClientGateway.prototype.onRemoveTable = function(client, cb) {
    client.on('remove-table', (data) => {
        cb(data);
    });
};

ClientGateway.prototype.onUpdateTable = function(client, cb) {
    client.on('update-table', (data) => {
        cb(data);
    });
};

ClientGateway.prototype.onJoinTable = function(client, cb) {
    client.on('join-table', (data) => {
        cb(data);
    });
};

module.exports = ClientGateway;
