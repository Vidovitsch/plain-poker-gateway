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
    this.receiver = new Receiver(options);
    this.sender = new Sender(options);
}

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

ClientGateway.prototype.onLobbyRequest = function(client, cb) {
    client.on('lobby-request', () => {
        cb();
    });
};

module.exports = ClientGateway;
