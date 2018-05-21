const { EventEmitter } = require('events');
const EventMessager = require('./../../services/eventMessager');

/**
 * [TableAmqpGateway description]
 * @param       {AmqpClient} amqpClient [description]
 * @constructor
 */
function TableAmqpGateway(amqpClient) {
  this.amqpClient = amqpClient;
  this.eventMessager = EventMessager.createInstance(new EventEmitter(), this.amqpClient);
}

const T = TableAmqpGateway.prototype;

/**
 * [sendCreateTableRequestAsync description]
 * @param  {String} sessionId [description]
 * @param  {Object} data      [description]
 * @return {Promise}           [description]
 */
T.sendCreateTableRequestAsync = function sendCreateTableRequestAsync(sessionId, data) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendRequestAsync('create-table-request', 'table_default', {
      sessionId,
      options: data,
    }).then((replyMessage) => {
      resolve(replyMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [sendJoinTableRequestAsync description]
 * @param  {String} sessionId [description]
 * @param  {String} tableId   [description]
 * @return {Promise}           [description]
 */
T.sendJoinTableRequestAsync = function sendJoinTableRequestAsync(sessionId, tableId) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendRequestAsync('join-table-request', 'table_default', {
      sessionId,
      tableId,
    }).then((replyMessage) => {
      resolve(replyMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [sendCreateDealerReplyAsync description]
 * @param  {Object} replyData      [description]
 * @param  {RpcMessage} requestMessage [description]
 * @return {Promise}                [description]
 */
T.sendCreateDealerReplyAsync = function sendCreateDealerReplyAsync(replyData, requestMessage) {
  return new Promise((resolve, reject) => {
    this.amqpClient.sendReplyAsync('create-dealer-reply', requestMessage, replyData).then((postedMessage) => {
      resolve(postedMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [onLobbyUpdate description]
 * @param  {String}   channelKey [description]
 * @param  {Function} callback   [description]
 */
T.onLobbyUpdate = function onLobbyUpdate(channelKey, callback) {
  const args = {
    queue: 'lobby_update',
    context: 'lobby-update',
    channelKey,
  };
  this.eventMessager.onEvent(args, (err, message) => {
    callback(err, message);
  });
};

/**
 * [onCreateDealerRequest description]
 * @param  {String}   channelKey [description]
 * @param  {Function} callback   [description]
 */
T.onCreateDealerRequest = function onCreateDealerRequest(channelKey, callback) {
  const args = {
    queue: 'dealer_default',
    context: 'create-dealer-request',
    channelKey,
  };
  this.eventMessager.onEvent(args, (err, message) => {
    callback(err, message);
  });
};

module.exports = {
  /**
   * [getInstance description]
   * @param  {AmqpClient} amqpClient [description]
   * @return {TableAmqpGateway}            [description]
   * @return {Error}            [description]
   */
  createInstance(amqpClient) {
    if (!amqpClient) {
      throw new Error('Invalid argument(s)');
    }
    return new TableAmqpGateway(amqpClient);
  },
};
