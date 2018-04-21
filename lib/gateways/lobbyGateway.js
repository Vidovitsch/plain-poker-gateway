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
        this.socket.emit('lobby-request');
        this.socket.on('lobby-reply', (data) => {
            try {
                resolve(JSON.parse(data.toString('utf8')));
            } catch (ex) {
                reject(ex);
            }
        });
    });
};

LobbyGateway.prototype.requestTableCreation = async function(clientQueue, options) {
    return new Promise((resolve, reject) => {
        this.socket.emit('create-table-request', JSON.stringify(options));
    });
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
