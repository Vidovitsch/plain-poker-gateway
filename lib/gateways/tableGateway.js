const Message = require('./../models/message');
const RpcMessage = require('./../models/rpcMessage');
const AmqpClient = require('./../services/amqpClient');
const EventEmitter = require('events').EventEmitter;
/**
 * [TableGateway description]
 * @param       {[type]} options [description]
 * @constructor
 */
function TableGateway(options) {
    this.amqpClient = new AmqpClient(options);
    this.eventEmitter = new EventEmitter();
}

const T = TableGateway.prototype;

T.onLobbyUpdate = function(callback) {
    const queue = 'lobby_update';
    const context = 'update-lobby';
    this.amqpClient.getSharedChannelAsync(queue).then((channel) => {
        this.initListener(channel, queue);
        this.amqpClient.bindQueue(channel, queue, context);
        this.eventEmitter.on(context, (request) => {
            callback(null, request);
        });
    });
};

T.initListener = function(channel, queue) {
    if (!this.amqpClient.isListening(queue)) {
        this.amqpClient.listen(channel, queue, (err, message) => {
            this.eventEmitter.emit(message.context, message);
        });
    }
};

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

T.removeTable = async function(table) {
    this.socket.emit('remove-table', JSON.stringify(table));
};

T.updateTable = async function(table) {
    this.socket.emit('update-table', JSON.stringify(table));
};

T.joinTable = async function(tableName, sessionId) {
    const message = new Message({
        sessionId: sessionId,
    });
    this.sender.send('create-table', JSON.stringify(message));
};

module.exports = TableGateway;
