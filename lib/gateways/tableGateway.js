const Receiver = require('../services/receiver');
const Sender = require('../services/receiver');

/**
 * [TableGateway description]
 * @param       {[type]} options [description]
 * @constructor
 */
function TableGateway(options) {
    this.receiver = new Receiver(options);
    this.sender = new Sender(options);
}

TableGateway.prototype.requestTableCreation = async function(clientQueue, options) {
    return new Promise((resolve, reject) => {
        this.socket.emit('create-table-request', JSON.stringify(options));
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
