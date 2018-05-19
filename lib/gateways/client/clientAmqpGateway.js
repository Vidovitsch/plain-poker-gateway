const { EventEmitter } = require('events');
const EventMessager = require('./../../services/eventMessager');

// Singleton support
let instance = null;

/**
 * [ClientGateway description]
 * @param  {Object} options [description]
 * @constructor
 */
function ClientAmqpGateway(amqpClient) {
  this.amqpClient = amqpClient;
  this.eventMessager = new EventMessager(new EventEmitter(), this.amqpClient);
}

const C = ClientAmqpGateway.prototype;

/**
 * [sendCreateTableReplyAsync description]
 * @param  {Object} replyData      [description]
 * @param  {RpcMessage} requestMessage [description]
 * @return {Promise}                [description]
 */
C.sendCreateTableReplyAsync = function sendCreateTableReplyAsync(replyData, requestMessage) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendReplyAsync('create-table-reply', requestMessage, replyData).then((postedMessage) => {
      resolve(postedMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [description]
 * @param  {Object} replyData [description]
 * @param  {Object} request   [description]
 * @return {Promise}           [description]
 */
C.sendJoinTableReplyAsync = function sendJoinTableReplyAsync(replyData, requestMessage) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendReplyAsync('join-table-reply', requestMessage, replyData).then((postedMessage) => {
      resolve(postedMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [description]
 * @param  {Function} callback [description]
 */
C.onCreateTableRequest = function onCreateTableRequest(channelKey, callback) {
  const args = {
    queue: 'table_default',
    context: 'create-table-request',
    channelKey,
  };
  this.eventMessager.onEvent(args, (err, requestMessage) => {
    callback(err, requestMessage);
  });
};

/**
 * [description]
 * @param  {Function} callback [description]
 */
C.onJoinTableRequest = function onJoinTableRequest(channelKey, callback) {
  const args = {
    queue: 'table_default',
    context: 'join-table-request',
    channelKey,
  };
  this.eventMessager.onEvent(args, (err, requestMessage) => {
    callback(err, requestMessage);
  });
};

module.exports = {
  getInstance(amqpClient) {
    if (!instance) {
      if (!amqpClient) {
        throw new Error('Invalid argument(s)');
      }
      instance = new ClientAmqpGateway(amqpClient);
    }
    return instance;
  },
};
