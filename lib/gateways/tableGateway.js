const util = require('util');
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
TableGateway.prototype.requestTableCreation = async function(options, sessionId) {
    return new Promise((resolve, reject) => {
        const message = new Message({
            options: options,
            sessionId: sessionId,
        });
        // Ensure the data has been sent before listening for a reply
        this.sender.send('create-table-request', JSON.stringify(message)).then(() => {
            return this.receiver.receiveOnce(
                util.format('client_%s_%s', options.name, sessionId), sessionId);
        }).then((message) => {
            resolve(JSON.parse(message.toString('utf8')));
        }).catch((err) => {
            reject(err);
        });
    });
};

TableGateway.prototype.removeTable = async function(table) {
    this.socket.emit('remove-table', JSON.stringify(table));
};

TableGateway.prototype.updateTable = async function(table) {
    this.socket.emit('update-table', JSON.stringify(table));
};

TableGateway.prototype.joinTable = async function(table) {
    this.socket.emit('join-table', JSON.stringify(table));
};

module.exports = TableGateway;
