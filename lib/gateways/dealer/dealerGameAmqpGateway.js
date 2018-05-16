const { EventEmitter } = require('events');
const EventMessager = require('./../../services/eventMessager');
const RpcMessage = require('./../../models/rpcMessage');

/**
 * [ClientGateway description]
 * @param  {Object} options [description]
 * @constructor
 */
function DealerGameAmqpGateway(amqpClient, dealerId) {
  this.dealerId = dealerId;
  this.amqpClient = amqpClient;
  this.eventMessager = new EventMessager(new EventEmitter(), this.amqpClient);
}

const D = DealerGameAmqpGateway.prototype;

D.sendCommunityCardsRequestAsync = function sendCommunityCardsRequestAsync(numberOfCards) {
  return new Promise((resolve, reject) => {
    const requestMessage = new RpcMessage('community-cards-request', {
      numberOfCards,
    });
    this.amqpClient.rpcAsync(requestMessage, `dealer_${this.dealerId}`).then((replyMessage) => {
      resolve(replyMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

D.sendPlayerCardsRequestAsync = function sendCommunityCardsRequestAsync(numberOfCards) {
  return new Promise((resolve, reject) => {
    const requestMessage = new RpcMessage('player-cards-request', {
      numberOfCards,
    });
    this.amqpClient.rpcAsync(requestMessage, `dealer_${this.dealerId}`).then((replyMessage) => {
      resolve(replyMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

module.exports = DealerGameAmqpGateway;
