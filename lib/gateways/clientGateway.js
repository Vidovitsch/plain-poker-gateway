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
    client.on('create-table', (table) => {
        cb(JSON.parse(table.toString('utf8')));
    });
};

ClientGateway.prototype.onRemoveTable = function(client, cb) {
    client.on('remove-table', (table) => {
        cb(JSON.parse(table.toString('utf8')));
    });
};

ClientGateway.prototype.onUpdateTable = function(client, cb) {
    client.on('update-table', (table) => {
        cb(JSON.parse(table.toString('utf8')));
    });
};

ClientGateway.prototype.onJoinTable = function(client, cb) {
    client.on('join-table', (table) => {
        cb(JSON.parse(table.toString('utf8')));
    });
};

module.exports = ClientGateway;
