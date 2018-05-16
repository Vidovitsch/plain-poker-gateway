const { EventEmitter } = require('events');
const EventMessager = require('./../../services/eventMessager');
const RpcMessage = require('./../../models/rpcMessage');

/**
 * [DealerGateway description]
 * @param  {Object} options [description]
 * @constructor
 */
function DealerAmqpGateway(amqpClient) {
  this.amqpClient = amqpClient;
  this.eventMessager = new EventMessager(new EventEmitter(), this.amqpClient);
}

const D = DealerAmqpGateway.prototype;

D.sendCreateDealerRequestAsync = function sendCreateDealerRequestAsync(tableId) {
  return new Promise((resolve, reject) => {
    const requestMessage = new RpcMessage('create-dealer-request', {
      tableId,
    });
    this.amqpClient.rpcAsync(requestMessage, 'dealer_default', 'table_default').then((replyMessage) => {
      resolve(replyMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

module.exports = DealerAmqpGateway;
