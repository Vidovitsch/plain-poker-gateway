const { EventEmitter } = require('events');
const EventMessager = require('./../../services/eventMessager');
const RpcMessage = require('./../../models/rpcMessage');
const ErrorMessage = require('./../../models/errorMessage');

/**
 * [TableGateway description]
 * @param  {Object} options [description]
 * @constructor
 */
function TableAmqpGateway(amqpClient) {
  this.amqpClient = amqpClient;
  this.eventMessager = new EventMessager(new EventEmitter(), this.amqpClient);
}

const T = TableAmqpGateway.prototype;

/**
 * [requestTableCreation description]
 * @param  {string} sessionId [description]
 * @param  {Object} data      [description]
 * @return {Promise}           [description]
 */
T.sendCreateTableRequestAsync = function sendCreateTableRequestAsync(sessionId, data) {
  const requestMessage = new RpcMessage('create-table-request', {
    sessionId,
    options: data,
  });
  return new Promise((resolve, reject) => {
    this.amqpClient.rpcAsync(requestMessage, 'table_default').then((replyMessage) => {
      resolve(replyMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

T.sendJoinTableRequestAsync = function sendJoinTableRequestAsync(sessionId, tableId) {
  const requestMessage = new RpcMessage('join-table-request', {
    sessionId,
    tableId,
  });
  return new Promise((resolve, reject) => {
    this.amqpClient.rpcAsync(requestMessage, 'table_default').then((replyMessage) => {
      resolve(replyMessage);
    }).catch((err) => {
      reject(err);
    });
  });
};

T.sendCreateDealerReplyAsync = function sendCreateDealerReplyAsync(replyData, requestMessage) {
  const context = 'create-dealer-reply';
  const replyMessage = replyData instanceof Error ?
    new ErrorMessage(context, replyData) :
    new RpcMessage(context, replyData);
  return new Promise((resolve, reject) => {
    this.amqpClient.sendAsync(replyMessage.toReply(requestMessage), replyMessage.replyTo).then(() => {
      resolve();
    }).catch((err) => {
      reject(err);
    });
  });
};

/**
 * [onLobbyUpdate description]
 * @param  {Function} callback [description]
 */
T.onLobbyUpdate = function onLobbyUpdate(channelKey, callback) {
  this.eventMessager.onEvent('lobby_update', 'lobby-update', channelKey, (err, message) => {
    callback(err, message);
  });
};

T.onCreateDealerRequest = function onCreateDealerRequest(channelKey, callback) {
  this.eventMessager.onEvent('dealer_default', 'create-dealer-request', channelKey, (err, message) => {
    console.log(message);
    callback(err, message);
  });
};

module.exports = TableAmqpGateway;
