const socket = require('socket.io-client');

/**
 * [LobbyGateway description]
 * @param       {[type]} options [description]
 * @constructor
 */
function LobbySocketGateway(options) {
  this.options = options || {};
  if (options.websocket) {
    this.socket = socket(`http://${options.websocket.host}:${options.websocket.port}`);
  }
}

const L = LobbySocketGateway.prototype;

L.onConnected = function onConnected(cb) {
  this.socket.on('connect', () => {
    cb();
  });
};

L.onDisconnected = function onDisconnected(cb) {
  this.socket.on('disconnect', () => {
    cb();
  });
};

L.requestLobby = function requestLobby() {
  return new Promise((resolve, reject) => {
    this.socket.emit('lobby-request');
    this.socket.on('lobby-reply', (data) => {
      try {
        resolve(JSON.parse(data.toString('utf8')));
      } catch (ex) {
        reject(ex);
      }
    });
  });
};

module.exports = LobbySocketGateway;
