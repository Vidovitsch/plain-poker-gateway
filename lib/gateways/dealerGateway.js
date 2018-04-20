const Receiver = require('../services/receiver');
const Sender = require('../services/receiver');

/**
 * [DealerGateway description]
 * @param       {[type]} options [description]
 * @constructor
 */
function DealerGateway(options) {
    this.receiver = new Receiver();
    this.sender = new Sender();
}

module.exports = DealerGateway;
