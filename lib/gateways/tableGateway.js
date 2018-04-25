const Message = require('../models/message');
const AmqpClient = require('../services/amqpClient');

/**
 * [TableGateway description]
 * @param       {[type]} options [description]
 * @constructor
 */
function TableGateway(options) {
    this.amqpClient = new AmqpClient(options);
    this.connection = null;
}

TableGateway.prototype.requestTableCreation = function(sessionId, options) {
    return new Promise((resolve, reject) => {
        const sendTo = 'table_default';
        const replyTo = `client_${sessionId}`;
        const message = new Message('rpc', 'create-table-request', {
            options: options,
            sessionId: sessionId,
        });
        this.amqpClient.rpcAsync(message, sendTo, replyTo).then((reply) => {
            resolve(reply);
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

TableGateway.prototype.joinTable = async function(tableName, sessionId) {
    const message = new Message({
        sessionId: sessionId,
    });
    this.sender.send('create-table', JSON.stringify(message));
};

module.exports = TableGateway;
