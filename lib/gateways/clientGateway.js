const socket = require('socket.io');
const AmqpClient = require('../services/amqpClient');
const EventEmitter = require('events').EventEmitter;

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
}

const C = ClientGateway.prototype;

C.onTableCreationRequest = function(callback) {
    const queue = 'table_default';
    const context = 'create-table-request';
    this.amqpClient.getSharedChannelAsync(queue).then((channel) => {
        this.initListener(channel, queue);
        this.amqpClient.bindQueue(channel, queue, context);
        this.eventEmitter.on(context, (request) => {
            callback(request);
        });
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

// Bad code: how does listener queue get removed when the queue doesn't exist anymore?
C.initListener = function(channel, queue) {
    if (!this.amqpClient.isListening(queue)) {
        this.amqpClient.listen(channel, queue, (err, message) => {
            this.eventEmitter.emit(message.context, message);
        });
    }
};

// WebSocket communication //

C.replyLobby = async function(data) {
    this.io.emit('lobby-reply', JSON.stringify(data));
};

C.broadcastUpdate = async function(data) {
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
