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
    this.receiver = new Receiver();
    this.sender = new Sender();
}

LobbyGateway.prototype.sendLobbyRequest = async function() {
    this.socket.emit('request-lobby');
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

LobbyGateway.prototype.onLobbyReply = function(cb) {
    this.socket.on('reply-lobby', (lobby) => {
        cb(JSON.parse(lobby.toString('utf8')));
    });
};

module.exports = LobbyGateway;
