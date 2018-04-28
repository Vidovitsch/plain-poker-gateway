const socket = require('socket.io');
const AmqpClient = require('../services/amqpClient');
const EventEmitter = require('events').EventEmitter;
const RpcMessage = require('./../models/rpcMessage');
const ErrMessage = require('./../models/errMessage');
const EventMessager = require('./../services/eventMessager');

/**
 * [ClientGateway description]
 * @param       {[type]} options [description]
 * @constructor
 */
function ClientGateway(options) {
    this.options = options || {};
    if (options.websocket) {
        this.io = socket.listen(options.websocket.port);
    }
    if (options.amqp) {
        this.amqpClient = new AmqpClient(options);
        const eventEmitter = new EventEmitter();
        this.eventMessager = new EventMessager(eventEmitter, this.amqpClient);
    }
}

const C = ClientGateway.prototype;

/**
 * [description]
 * @param  {Function} callback [description]
 */
C.onTableCreationRequest = function(callback) {
    this.eventMessager.onEvent('table_default', 'create-table-request', (request) => {
        callback(null, request);
    });
    callback(new Error(''));
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

/**
 * [description]
 * @param  {[type]} replyData [description]
 * @param  {[type]} request   [description]
 * @return {[type]}           [description]
 */
C.sendTableCreationReply = function(replyData, request) {
    return new Promise((resolve, reject) => {
        const reply = replyData instanceof Error ?
            new ErrMessage('create-table-reply', replyData).toReply(request) :
            new RpcMessage('create-table-reply', replyData).toReply(request);
        this.amqpClient.sendAsync(reply, reply.replyTo).then(() => {
            resolve();
        }).catch((err) => {
            reject(err);
        });
    });
};

// WebSocket communication //

/**
 * [description]
 * @param  {[type]}   client   [description]
 * @param  {Function} callback [description]
 */
C.onLobbyRequest = function(client, callback) {
    client.on('lobby-request', () => {
        callback();
    });
};

/**
 * [description]
 * @param  {Client} client [description]
 * @param  {Lobby} lobby  [description]
 */
C.sendLobbyReply = function(client, lobby) {
    client.emit('lobby-reply', JSON.stringify(lobby));
};

/**
 * [description]
 * @param  {[type]} table [description]
 */
C.broadcastLobbyUpdate = function(table) {
    this.io.emit('update-lobby', JSON.stringify(table));
};

/**
 * [description]
 * @param  {Function} callback [description]
 */
C.onClientConnected = function(callback) {
    this.io.on('connection', (client) => {
        callback(client);
    });
};

/**
 * [description]
 * @param  {[type]}   client   [description]
 * @param  {Function} callback [description]
 */
C.onClientDisconnected = function(client, callback) {
    client.on('disconnect', () => {
        callback();
    });
};

module.exports = ClientGateway;
