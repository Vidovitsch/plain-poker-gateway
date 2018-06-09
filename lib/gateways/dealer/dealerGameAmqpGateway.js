const { EventEmitter } = require('events');
const EventMessager = require('./../../services/eventMessager');
const Message = require('./../../models/message');

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
    console.log(numberOfCards);
    console.log(sendTo);
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
D.sendPlayerCardsRequestAsync = function sendCommunityCardsRequestAsync(numberOfCards, sessions, sendTo) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendRequestAsync('player-cards-request', sendTo, {
      numberOfCards,
      sessions,
    }).then((replyMessage) => {
      resolve(replyMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

D.sendEndGameRequestAsync = function sendEndGameRequestAsync(communityCards, sendTo) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendRequestAsync('end-game-request', sendTo, {
      communityCards,
    }).then((replyMessage) => {
      resolve(replyMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

D.sendReturnCardsRequestAsync = function sendBackCardsAsync(cards, sendTo) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendRequestAsync('return-cards-request', sendTo, {
      cards,
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
  createInstance(amqpClient) {
    if (!amqpClient) {
      throw new Error('Invalid argument(s)');
    }
    return new DealerGameAmqpGateway(amqpClient);
  },
};
