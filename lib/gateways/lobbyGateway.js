const AmqpClient = require('../services/amqpClient');
const EventEmitter = require('events').EventEmitter;
const RpcMessage = require('./../models/rpcMessage');
const Message = require('./../models/rpcMessage');
const EventMessager = require('./../services/eventMessager');

/**
 * [LobbyGateway description]
 * @param       {[type]} options [description]
 * @constructor
 */
function LobbyGateway(options) {
    this.options = options || {};
    if (options.amqp) {
        this.amqpClient = new AmqpClient(options);
        const eventEmitter = new EventEmitter();
        this.eventMessager = new EventMessager(eventEmitter, this.amqpClient);
    }
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
