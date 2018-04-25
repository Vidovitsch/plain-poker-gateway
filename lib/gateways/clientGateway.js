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

C.getTableQueueChannel= function() {
    return new Promise((resolve, reject) => {
        // Listeners share the same connection for resource efficiency
        this.getSharedConnection().then((connection) => {
            return this.amqpClient.createChannelAsync(connection);
        }).then((channel) => {
            // Listen on channel creation
            this.amqpClient.listen(channel, 'table_default', (err, message) => {
                this.eventEmitter.emit(message.context, message);
            });
            resolve(channel);
        }).catch((err) => {
            reject(err);
        });
    });
};

C.onTableCreationRequest = function(channel, callback) {
    const queue = 'table_default';
    const context = 'create-table-request';
    this.amqpClient.bindQueue(channel, queue, context);
    this.eventEmitter.on(context, (request) => {
        callback(request);
    });
};

C.onTableRemovalRequest = function(channel, callback) {
    const queue = 'table_default';
    const context = 'remove-table-request';
    this.amqpClient.bindQueue(channel, queue, context);
    this.eventEmitter.on(context, (request) => {
        callback(request);
    });
};

C.onTableUpdateRequest = function(channel, callback) {
    const queue = 'table_default';
    const context = 'update-table-request';
    this.amqpClient.bindQueue(channel, queue, context);
    this.eventEmitter.on(context, (request) => {
        callback(request);
    });
};

C.onTableJoinRequest = function(channel, callback) {
    const queue = 'table_default';
    const context = 'join-table-request';
    this.amqpClient.bindQueue(channel, queue, context);
    this.eventEmitter.on(context, (request) => {
        callback(request);
    });
};

C.onGameMessage = function(cb) {
    // // TODO:
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
