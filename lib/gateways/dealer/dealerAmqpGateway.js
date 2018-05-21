const { EventEmitter } = require('events');
const EventMessager = require('./../../services/eventMessager');

/**
 * [DealerAmqpGateway description]
 * @param       {Object} amqpClient [description]
 * @constructor
 */
function DealerAmqpGateway(amqpClient) {
  this.amqpClient = amqpClient;
  this.eventMessager = EventMessager.createInstance(new EventEmitter(), this.amqpClient);
}

const D = DealerAmqpGateway.prototype;

/**
 * [sendCreateDealerRequestAsync description]
 * @param  {String} tableId [description]
 * @return {Promise}         [description]
 */
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
  /**
   * [getInstance description]
   * @param  {AmqpClient} amqpClient [description]
   * @return {DealerAmqpGateway}            [description]
   * @return {Error}            [description]
   */
  createInstance(amqpClient) {
    if (!amqpClient) {
      throw new Error('Invalid argument(s)');
    }
    return new DealerAmqpGateway(amqpClient);
  },
};
