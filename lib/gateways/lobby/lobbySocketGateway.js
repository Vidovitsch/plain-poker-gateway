const socket = require('socket.io-client');
const RpcMessage = require('./../../models/rpcMessage');

// Singleton support
let instance = null;

/**
 * [LobbyGateway description]
 * @param  {Object} options [description]
 * @constructor
 */
function LobbySocketGateway(options) {
  this.host = options.host;
  this.port = options.port || 5000;
}

const L = LobbySocketGateway.prototype;

/**
 * [requestLobby description]
 * @return {Promise} [description]
 */
L.sendLobbyRequestAsync = function sendLobbyRequestAsync() {
  const context = 'lobby-request';
  const requestMessage = RpcMessage.createInstance(context);
  this.socket.emit(context, JSON.stringify(requestMessage));
  return new Promise((resolve, reject) => {
    this.socket.on('lobby-reply', (replyMessage) => {
      try {
        resolve(JSON.parse(replyMessage.toString('utf8')));
      } catch (err) {
        reject(err);
      }
    });
  });
};

L.onLobbyUpdate = function onLobbyUpdate(callback) {
  this.socket.on('lobby-update', (message) => {
    try {
      callback(null, JSON.parse(message.toString('utf8')));
    } catch (err) {
      callback(err);
    }
  });
};

L.connect = function connect() {
  this.socket = socket(`http://${this.host}:${this.port}`);
};

L.disconnect = function disconnect() {
  this.socket.disconnect();
};

/**
 * [onConnected description]
 * @param  {Function} callback [description]
 */
L.onConnected = function onConnected(callback) {
  this.socket.on('connect', () => {
    callback();
  });
};

/**
 * [onDisconnected description]
 * @param  {Function} callback [description]
 */
L.onDisconnected = function onDisconnected(callback) {
  this.socket.on('disconnect', () => {
    callback();
  });
};

module.exports = {
  getInstance(options) {
    if (!instance) {
      if (!options) {
        throw new Error('Invalid argument(s)');
      }
      instance = new LobbySocketGateway(options);
    }
    return instance;
  },
};
