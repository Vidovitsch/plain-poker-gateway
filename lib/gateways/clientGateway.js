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
    this.eventEmitter = new EventEmitter();
    this.eventMessager = new EventMessager(this.amqpClient);
}

const C = ClientGateway.prototype;

/**
 * [description]
 * @param  {Function} callback [description]
 */
C.onTableCreationRequest = function(callback) {
    const queue = 'table_default';
    const context = 'create-table-request';
    this.eventMessager.onEvent(queue, context, this.eventEmitter, (request) => {
        callback(null, request);
    });
};

C.onTableRemovalRequest = function(callback) {
    const queue = 'table_default';
    const context = 'remove-table-request';
    this.amqpClient.getSharedChannelAsync(queue).then((channel) => {
        this.initListener(channel, queue);
        this.amqpClient.bindQueue(channel, queue, context);
        this.eventEmitter.on(context, (request) => {
            callback(request);
        });
    });
};

C.onTableUpdateRequest = function(callback) {
    const queue = 'table_default';
    const context = 'update-table-request';
    this.amqpClient.getSharedChannelAsync(queue).then((channel) => {
        this.initListener(channel, queue);
        this.amqpClient.bindQueue(channel, queue, context);
        this.eventEmitter.on(context, (request) => {
            callback(request);
        });
    });
};

C.onTableJoinRequest = function(callback) {
    const queue = 'table_default';
    const context = 'join-table-request';
    this.amqpClient.getSharedChannelAsync(queue).then((channel) => {
        this.initListener(channel, queue);
        this.amqpClient.bindQueue(channel, queue, context);
        this.eventEmitter.on(context, (request) => {
            callback(request);
        });
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
