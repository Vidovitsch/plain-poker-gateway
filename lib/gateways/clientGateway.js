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
    this.sharedConnection = null;
    this.eventEmitter = new EventEmitter();
}

ClientGateway.prototype.getTableQueueChannel= function() {
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

ClientGateway.prototype.onTableCreationRequest = function(channel, callback) {
    const queue = 'table_default';
    const context = 'create-table-request';
    this.amqpClient.bindQueue(channel, queue, context);
    this.eventEmitter.on(context, (request) => {
        callback(request);
    });
};

ClientGateway.prototype.onTableRemovalRequest = function(channel, callback) {
    const queue = 'table_default';
    const context = 'remove-table-request';
    this.amqpClient.bindQueue(channel, queue, context);
    this.eventEmitter.on(context, (request) => {
        callback(request);
    });
};

ClientGateway.prototype.onTableUpdateRequest = function(channel, callback) {
    const queue = 'table_default';
    const context = 'update-table-request';
    this.amqpClient.bindQueue(channel, queue, context);
    this.eventEmitter.on(context, (request) => {
        callback(request);
    });
};

ClientGateway.prototype.onTableJoinRequest = function(channel, callback) {
    const queue = 'table_default';
    const context = 'join-table-request';
    this.amqpClient.bindQueue(channel, queue, context);
    this.eventEmitter.on(context, (request) => {
        callback(request);
    });
};

ClientGateway.prototype.onGameMessage = function(cb) {
    // // TODO:
};

// WebSocket communication //

ClientGateway.prototype.replyLobby = async function(data) {
    this.io.emit('lobby-reply', JSON.stringify(data));
};

ClientGateway.prototype.broadcastUpdate = async function(data) {
    this.io.emit('update-lobby', JSON.stringify(data));
};

ClientGateway.prototype.onClientConnected = function(cb) {
    this.io.on('connection', (client) => {
        cb(client);
    });
};

ClientGateway.prototype.onClientDisconnected = function(client, cb) {
    client.on('disconnect', () => {
        cb();
    });
};

ClientGateway.prototype.onLobbyRequest = function(client, callback) {
    client.on('lobby-request', () => {
        callback();
    });
};

ClientGateway.prototype.getSharedConnection = function() {
    return new Promise((resolve, reject) => {
        if (!this.sharedConnection) {
            this.amqpClient.connectAsync().then((connection) => {
                this.sharedConnection = connection;
                resolve(connection);
            }).catch((err) => {
                reject(err);
            });
        } else {
            resolve(this.sharedConnection);
        }
    });
};

module.exports = ClientGateway;
