const socket = require('socket.io-client');

/**
 * [LobbyGateway description]
 * @param       {[type]} options [description]
 * @constructor
 */
function LobbySocketGateway(options) {
  this.host = options.host;
  this.port = options.port || 5000;
  this.socket = socket(`http://${options.host}:${options.port}`);
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
