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
    if (options.websocket) {
        this.socket = socket(util.format(
            'http://%s:%s',
            options.websocket.host,
            options.websocket.port));
    }
    if (options.amqp) {
        // TODO: implement option handlers
    }
    this.receiver = new Receiver();
    this.sender = new Sender();
}

LobbyGateway.prototype.requestLobby = async function() {
    return new Promise((resolve, reject) => {
        this.socket.emit('request-lobby');
        this.socket.on('reply-lobby', (data) => {
            try {
                const lobby = JSON.parse(data.toString('utf8'));
                resolve(lobby);
            } catch (ex) {
                reject(ex);
            }
        });
    });
};

LobbyGateway.prototype.createTable = async function(table) {
    this.socket.emit('create-table', JSON.stringify(table));
};

LobbyGateway.prototype.removeTable = async function(table) {
    this.socket.emit('remove-table', JSON.stringify(table));
};

LobbyGateway.prototype.updateTable = async function(table) {
    this.socket.emit('update-table', JSON.stringify(table));
};

LobbyGateway.prototype.joinTable = async function(table) {
    this.socket.emit('join-table', JSON.stringify(table));
};

LobbyGateway.prototype.onConnected = function(cb) {
    this.socket.on('connect', () => {
        cb();
    });
};

LobbyGateway.prototype.onDisconnected = function(cb) {
    this.socket.on('disconnect', () => {
        cb();
    });
};

module.exports = LobbyGateway;
