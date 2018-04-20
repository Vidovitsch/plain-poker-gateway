const Receiver = require('../services/receiver');
const Sender = require('../services/receiver');

/**
 * [TableGateway description]
 * @param       {[type]} options [description]
 * @constructor
 */
function TableGateway(options) {
    this.options = options || {};
    this.receiver = new Receiver();
    this.sender = new Sender();
}

module.exports = TableGateway;
