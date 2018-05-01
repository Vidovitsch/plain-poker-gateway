const socket = require('socket.io');

/**
 * [ClientGateway description]
 * @param       {[type]} options [description]
 * @constructor
 */
function ClientSocketGateway(options) {
  this.options = options || {};
  if (options.websocket) {
    this.io = socket.listen(options.websocket.port);
  }
}

const C = ClientSocketGateway.prototype;

/**
 * [description]
 * @param  {Socket}   client   [description]
 * @param  {Function} callback [description]
 */
C.onLobbyRequest = function onLobbyRequest(client, callback) {
  client.on('lobby-request', () => {
    callback();
  });
};

/**
 * [description]
 * @param  {Socket} client [description]
 * @param  {Lobby} lobby  [description]
 */
C.sendLobbyReply = function sendLobbyReply(client, lobby) {
  client.emit('lobby-reply', JSON.stringify(lobby));
};

/**
 * [description]
 * @param  {[type]} table [description]
 */
C.broadcastLobbyUpdate = function broadcastLobbyUpdate(table) {
  this.io.emit('update-lobby', JSON.stringify(table));
};

/**
 * [description]
 * @param  {Function} callback [description]
 */
C.onClientConnected = function onClientConnected(callback) {
  this.io.on('connection', (client) => {
    callback(client);
  });
};

/**
 * [description]
 * @param  {[type]}   client   [description]
 * @param  {Function} callback [description]
 */
C.onClientDisconnected = function onClientDisconnected(client, callback) {
  client.on('disconnect', () => {
    callback();
  });
};

module.exports = ClientSocketGateway;
