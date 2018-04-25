const socket = require('socket.io-client');
const Message = require('./../models/message');
const RpcMessage = require('./../models/rpcMessage');
const AmqpClient = require('./../services/amqpClient');

/**
 * [LobbyGateway description]
 * @param       {[type]} options [description]
 * @constructor
 */
function LobbyGateway(options) {
    if (options.websocket) {
        this.socket = socket(`http://${options.websocket.host}:${options.websocket.port}`);
    }
    this.amqpClient = new AmqpClient(options);
}

const L = LobbyGateway.prototype;

L.sendLobbyUpdate = function(table) {
    return new Promise((resolve, reject) => {
        const message = new Message('update-lobby', table);
        this.amqpClient.sendAsync(message, 'lobby_update').then(() => {
            resolve();
        }).catch((err) => {
            reject(err);
        });
    });
};

// WebSocket communication //

L.requestLobby = async function() {
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

L.onConnected = function(cb) {
    this.socket.on('connect', () => {
        cb();
    });
};

L.onDisconnected = function(cb) {
    this.socket.on('disconnect', () => {
        cb();
    });
};

module.exports = LobbyGateway;
