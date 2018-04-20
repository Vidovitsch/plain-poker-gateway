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

LobbyGateway.prototype.sendLobbyRequest = async function() {
    this.socket.emit('request-lobby', {});
};

LobbyGateway.prototype.createTable = async function(data) {
    this.socket.emit('create-table', data);
};

LobbyGateway.prototype.removeTable = async function(data) {
    this.socket.emit('remove-table', data);
};

LobbyGateway.prototype.updateTable = async function(data) {
    this.socket.emit('update-table', data);
};

LobbyGateway.prototype.joinTable = async function(data) {
    this.socket.emit('join-table', data);
};

LobbyGateway.prototype.onConnected = function(cb){
    this.socket.on('connect', () => {
        cb('Connected with lobby');
    });
};

LobbyGateway.prototype.onDisconnected = function(cb) {
    this.socket.on('disconnect', () => {
        cb('Disonnected with lobby');
    });
};

LobbyGateway.prototype.onLobbyReply = function(cb) {
    this.socket.on('reply-lobby', (data) => {
        cb(data);
    });
};

module.exports = LobbyGateway;
