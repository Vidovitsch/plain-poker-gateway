const socket = require('socket.io-client');
const util = require('util');

const Receiver = require('../services/receiver');
const Sender = require('../services/receiver');

/**
 * [LobbyGateway description]
 * @param       {[type]} options [description]
 * @constructor
 */
function LobbyGateway(options) {
    this.options = options || {};
    if (options.websocket) {
        this.socket = socket(util.format(
            'http://%s:%s',
            options.websocket.host,
            options.websocket.port));
    }
    if (options.amqp) {
        // TODO: implement option handlers
    }
}

LobbyGateway.prototype.sendLobbyRequest = async () => {
    this.socket.emit('request-lobby', {});
};

LobbyGateway.prototype.createTable = async (data) => {
    this.socket.emit('create-table', data);
};

LobbyGateway.prototype.removeTable = async (data) => {
    this.socket.emit('remove-table', data);
};

LobbyGateway.prototype.updateTable = async (data) => {
    this.socket.emit('update-table', data);
};

LobbyGateway.prototype.joinTable = async (data) => {
    this.socket.emit('join-table', data);
};

LobbyGateway.prototype.onConnected = () => {
    return new Promise((resolve, reject) => {
        this.socket.on('connect', () => {
            resolve('Connected with lobby');
        });
    });
};

LobbyGateway.prototype.onDisconnected = () => {
    return new Promise((resolve, reject) => {
        this.socket.on('disconnect', () => {
            resolve('Disonnected with lobby');
        });
    });
};

LobbyGateway.prototype.onLobbyReply = () => {
    return new Promise((resolve, reject) => {
        this.socket.on('reply-lobby', (data) => {
            resolve(data);
        });
    });
};


LobbyGateway.prototype.onConnected = () => {
    return new Promise((resolve, reject) => {
        this.socket.on('connect', () => {
            resolve('Connected with lobby');
        });
    });
};

module.exports = LobbyGateway;
