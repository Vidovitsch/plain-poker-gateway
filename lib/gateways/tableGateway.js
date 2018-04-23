const Receiver = require('../services/receiver');
const Sender = require('../services/receiver');
const Message = require('../models/message');

/**
 * [TableGateway description]
 * @param       {[type]} options [description]
 * @constructor
 */
function TableGateway(options) {
    this.receiver = new Receiver(options);
    this.sender = new Sender(options);
}

/**
 * [description]
 * @param  {[type]} options   [description]
 * @param  {[type]} sessionId [description]
 * @return {[type]}           [description]
 */

TableGateway.prototype.onMessage = function(sessionId, cb) {
    // const queue = util.format('client_%s', sessionId);
    this.receiver.startReceiving();
};

TableGateway.prototype.onGameMessage = function(sessionId, tableName, cb) {
    // const queue = util.format('client_%s_%s', tableName, sessionId);
    this.receiver.startReceiving();
};

TableGateway.prototype.createTable = async function(options, sessionId) {
    const message = new Message('create-table', {
        options: options,
        sessionId: sessionId,
    });
    this.sender.send(message).then(() => {
        console.log('message sent');
    }).catch((err) => {
        console.log(err);
    });
};

TableGateway.prototype.removeTable = async function(table) {
    this.socket.emit('remove-table', JSON.stringify(table));
};

TableGateway.prototype.updateTable = async function(table) {
    this.socket.emit('update-table', JSON.stringify(table));
};

TableGateway.prototype.joinTable = async function(tableName, sessionId) {
    const message = new Message({
        sessionId: sessionId,
    });
    this.sender.send('create-table', JSON.stringify(message));
};

module.exports = TableGateway;
