const socket = require('socket.io');
const AmqpClient = require('../services/amqpClient');
const EventEmitter = require('events').EventEmitter;
const RpcMessage = require('./../models/rpcMessage');
const EventMessager = require('./../services/eventMessager');

/**
 * [ClientGateway description]
 * @param       {[type]} options [description]
 * @constructor
 */
function ClientGateway(options) {
    if (options.websocket) {
        this.io = socket.listen(options.websocket.port);
    }
    this.amqpClient = new AmqpClient(options);
    const eventEmitter = new EventEmitter();
    this.eventMessager = new EventMessager(eventEmitter, this.amqpClient);
}

const C = ClientGateway.prototype;

/**
 * [description]
 * @param  {Function} callback [description]
 */
C.onTableCreationRequest = function(callback) {
    this.eventMessager.onEvent('table_default', 'create-table-request', (request) => {
        callback(request);
    });
};

/**
 * [description]
 * @param  {Function} callback [description]
 */
C.onTableRemovalRequest = function(callback) {
    this.eventMessager.onEvent('table_default', 'remove-table-request', (request) => {
        callback(request);
    });
};

/**
 * [description]
 * @param  {Function} callback [description]
 */
C.onTableUpdateRequest = function(callback) {
    this.eventMessager.onEvent('table_default', 'update-table-request', (request) => {
        callback(request);
    });
};

/**
 * [description]
 * @param  {Function} callback [description]
 */
C.onTableJoinRequest = function(callback) {
    this.eventMessager.onEvent('table_default', 'join-table-request', (request) => {
        callback(request);
    });
};

C.sendTableCreationReply = function(data, request) {
    return new Promise((resolve, reject) => {
        const reply = new RpcMessage('create-table-reply', data).toReply(request);
        this.amqpClient.sendAsync(reply, reply.replyTo).then(() => {
            resolve();
        }).catch((err) => {
            reject(err);
        });
    });
};

// Bad code: how does listener queue get removed when the queue doesn't exist anymore?
C.initListener = function(channel, queue) {
    if (!this.amqpClient.isListening(queue)) {
        this.amqpClient.listen(channel, queue, (err, message) => {
            this.eventEmitter.emit(message.context, message);
        });
    }
};

// WebSocket communication //

C.replyLobby = function(data) {
    this.io.emit('lobby-reply', JSON.stringify(data));
};

C.broadcastUpdate = function(data) {
    this.io.emit('update-lobby', JSON.stringify(data));
};

C.onClientConnected = function(cb) {
    this.io.on('connection', (client) => {
        cb(client);
    });
};

C.onClientDisconnected = function(client, cb) {
    client.on('disconnect', () => {
        cb();
    });
};

C.onLobbyRequest = function(client, callback) {
    client.on('lobby-request', () => {
        callback();
    });
};

module.exports = ClientGateway;
