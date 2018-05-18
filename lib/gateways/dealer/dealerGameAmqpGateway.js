const { EventEmitter } = require('events');
const EventMessager = require('./../../services/eventMessager');

// Singleton support
let instance = null;

/**
 * [ClientGateway description]
 * @param  {Object} options [description]
 * @constructor
 */
function DealerGameAmqpGateway(amqpClient) {
  this.amqpClient = amqpClient;
  this.eventMessager = new EventMessager(new EventEmitter(), this.amqpClient);
}

const D = DealerGameAmqpGateway.prototype;

D.sendCommunityCardsRequestAsync = function sendCommunityCardsRequestAsync(dealerId, numberOfCards) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendRequestAsync('community-cards-request', `dealer_${dealerId}`, {
      numberOfCards,
    }).then((replyMessage) => {
      resolve(replyMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

D.sendPlayerCardsRequestAsync = function sendCommunityCardsRequestAsync(dealerId, numberOfCards) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendRequestAsync('player-cards-request', `dealer_${dealerId}`, {
      numberOfCards,
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
      instance = new DealerGameAmqpGateway(amqpClient);
    }
    return instance;
  },
};
