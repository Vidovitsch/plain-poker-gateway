const { EventEmitter } = require('events');
const EventMessager = require('./../../services/eventMessager');

/**
 * [ClientGameAmqpGateway description]
 * @param       {AmqpClient} amqpClient [description]
 * @constructor
 */
function ClientGameAmqpGateway(amqpClient) {
  this.amqpClient = amqpClient;
  this.eventMessager = EventMessager.createInstance(new EventEmitter(), this.amqpClient);
}

const C = ClientGameAmqpGateway.prototype;

C.sendLeaveGameReplyAsync = function sendLeaveGameReplyAsync(replyData, requestMessage) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendReplyAsync('leave-game-reply', requestMessage, replyData).then((postedMessage) => {
      resolve(postedMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

C.onLeaveGameRequestAsync = function onLeaveGameRequestAsync(channelKey, receiveFrom, callback) {
  const args = {
    queue: receiveFrom,
    context: 'leave-game-request',
    channelKey,
  };
  this.eventMessager.onEvent(args, (err, requestMessage) => {
    callback(err, requestMessage);
  });
};

module.exports = {
  /**
   * [getInstance description]
   * @param  {AmqpClient} amqpClient [description]
   * @return {ClientGameAmqpGateway}            [description]
   * @return {Error}            [description]
   */
  createInstance(amqpClient) {
    if (!amqpClient) {
      throw new Error('Invalid argument(s)');
    }
    return new ClientGameAmqpGateway(amqpClient);
  },
};
