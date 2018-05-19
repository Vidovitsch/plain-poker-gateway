const { EventEmitter } = require('events');
const EventMessager = require('./../../services/eventMessager');

// Singleton support
let instance = null;

/**
 * [DealerGameAmqpGateway description]
 * @param       {AmqpClient} amqpClient [description]
 * @constructor
 */
function DealerGameAmqpGateway(amqpClient) {
  this.amqpClient = amqpClient;
  this.eventMessager = EventMessager.createInstance(new EventEmitter(), this.amqpClient);
}

const D = DealerGameAmqpGateway.prototype;

/**
 * [sendCommunityCardsRequestAsync description]
 * @param  {String} dealerId      [description]
 * @param  {Number} numberOfCards [description]
 * @return {Promise}               [description]
 */
D.sendCommunityCardsRequestAsync = function sendCommunityCardsRequestAsync(numberOfCards, sendTo) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendRequestAsync('community-cards-request', sendTo, {
      numberOfCards,
    }).then((replyMessage) => {
      resolve(replyMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [sendCommunityCardsRequestAsync description]
 * @param  {String} dealerId      [description]
 * @param  {Number} numberOfCards [description]
 * @return {Promise}               [description]
 */
D.sendPlayerCardsRequestAsync = function sendCommunityCardsRequestAsync(numberOfCards, sendTo) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendRequestAsync('player-cards-request', sendTo, {
      numberOfCards,
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
   * @return {DealerGameAmqpGateway}            [description]
   * @return {Error}            [description]
   */
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
