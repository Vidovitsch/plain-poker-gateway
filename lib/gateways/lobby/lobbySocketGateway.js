const socket = require('socket.io-client');
const RpcMessage = require('./../../models/rpcMessage');

/**
 * [LobbyGateway description]
 * @param  {Object} options [description]
 * @constructor
 */
function LobbySocketGateway(options) {
  this.host = options.host;
  this.port = options.port || 5000;
  this.socket = socket(`http://${options.host}:${options.port}`);
}

const L = LobbySocketGateway.prototype;

/**
 * [requestLobby description]
 * @return {Promise} [description]
 */
L.requestLobby = function requestLobby() {
  const context = 'lobby-update';
  const request = new RpcMessage(context);
  this.socket.emit(context, JSON.stringify(request));
  return new Promise((resolve, reject) => {
    this.socket.on('lobby-reply', (reply) => {
      try {
        resolve(JSON.parse(reply.toString('utf8')));
      } catch (err) {
        reject(err);
      }
    });
  });
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

module.exports = LobbySocketGateway;
