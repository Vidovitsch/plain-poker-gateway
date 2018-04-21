const socket = require('socket.io');
const Receiver = require('../services/receiver');
const Sender = require('../services/receiver');

/**
 * [ClientGateway description]
 * @param       {[type]} options [description]
 * @constructor
 */
function ClientGateway(options) {
    if (options.websocket) {
        this.io = socket.listen(options.websocket.port);
    }
    if (options.amqp) {
        // TODO: implement option handlers
    }
    this.receiver = new Receiver();
    this.sender = new Sender();
}

// WebSocket communication //

ClientGateway.prototype.replyLobby = async function(data) {
    this.io.emit('reply-lobby', JSON.stringify(data));
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

ClientGateway.prototype.onLobbyRequest = function(client, cb) {
    client.on('request-lobby', () => {
        cb();
    });
};

ClientGateway.prototype.onCreateTable = function(client, cb) {
    client.on('create-table', (data) => {
        try {
            const table = JSON.parse(data.toString('utf8'));
            cb(null, table);
        } catch (ex) {
            cb(ex);
        }
    });
};

ClientGateway.prototype.onRemoveTable = function(client, cb) {
    client.on('remove-table', (data) => {
        try {
            const table = JSON.parse(data.toString('utf8'));
            cb(null, table);
        } catch (ex) {
            cb(ex);
        }
    });
};

ClientGateway.prototype.onUpdateTable = function(client, cb) {
    client.on('update-table', (data) => {
        try {
            const table = JSON.parse(data.toString('utf8'));
            cb(null, table);
        } catch (ex) {
            cb(ex);
        }
    });
};

ClientGateway.prototype.onJoinTable = function(client, cb) {
    client.on('join-table', (data) => {
        try {
            const table = JSON.parse(data.toString('utf8'));
            cb(null, table);
        } catch (ex) {
            cb(ex);
        }
    });
};

module.exports = ClientGateway;
