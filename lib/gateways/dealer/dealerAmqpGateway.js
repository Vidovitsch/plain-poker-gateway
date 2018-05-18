const { EventEmitter } = require('events');
const EventMessager = require('./../../services/eventMessager');

// Singleton support
let instance = null;

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
    this.amqpClient.sendRequestAsync('create-dealer-request', 'dealer_default', {
      tableId,
    }).then((replyMessage) => {
      resolve(replyMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

module.exports = {
  getInstance(amqpClient) {
    if (!instance) {
      if (!amqpClient) {
        throw new Error('Invalid argument(s)');
      }
      instance = new DealerAmqpGateway(amqpClient);
    }
    return instance;
  },
};
