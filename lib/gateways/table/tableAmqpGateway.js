const { EventEmitter } = require('events');
const EventMessager = require('./../../services/eventMessager');

// Singleton support
let instance = null;

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
 * @param  {Function} callback [description]
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
  getInstance(amqpClient) {
    if (!instance) {
      if (!amqpClient) {
        throw new Error('Invalid argument(s)');
      }
      instance = new TableAmqpGateway(amqpClient);
    }
    return instance;
  },
};
