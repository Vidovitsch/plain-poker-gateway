const Message = require('./../models/message');
const RpcMessage = require('./../models/rpcMessage');
const AmqpClient = require('./../services/amqpClient');
const EventEmitter = require('events').EventEmitter;
const EventMessager = require('./../services/eventMessager');

/**
 * [TableGateway description]
 * @param       {[type]} options [description]
 * @constructor
 */
function TableGateway(options) {
    this.options = options || {};
    if (options.amqp) {
        this.amqpClient = new AmqpClient(options);
        const eventEmitter = new EventEmitter();
        this.eventMessager = new EventMessager(eventEmitter, this.amqpClient);
    }
}

const T = TableGateway.prototype;

T.requestTableCreation = function(sessionId, options) {
    return new Promise((resolve, reject) => {
        const message = new RpcMessage('create-table-request', options);
        this.amqpClient.rpcAsync(message, 'table_default', `client_${sessionId}`).then((reply) => {
            resolve(reply);
        }).catch((err) => {
            reject(err);
        });
    });
};

T.requestTableRemoval = function(sessionId, options) {
    return new Promise((resolve, reject) => {
        const message = new RpcMessage('remove-table-request', options);
        this.amqpClient.rpcAsync(message, 'table_default', `client_${sessionId}`).then((reply) => {
            resolve(reply);
        }).catch((err) => {
            reject(err);
        });
    });
};

T.requestTableUpdate = function(sessionId, options) {
    return new Promise((resolve, reject) => {
        const message = new RpcMessage('update-table-request', options);
        this.amqpClient.rpcAsync(message, 'table_default', `client_${sessionId}`).then((reply) => {
            resolve(reply);
        }).catch((err) => {
            reject(err);
        });
    });
};

T.requestTableJoin = function(sessionId, options) {
    return new Promise((resolve, reject) => {
        const message = new RpcMessage('join-table-request', options);
        this.amqpClient.rpcAsync(message, 'table_default', `client_${sessionId}`).then((reply) => {
            resolve(reply);
        }).catch((err) => {
            reject(err);
        });
    });
};

T.onLobbyUpdate = function(callback) {
    this.eventMessager.onEvent('lobby_update', 'update-lobby', (request) => {
        callback(request);
    });
};

module.exports = TableGateway;
