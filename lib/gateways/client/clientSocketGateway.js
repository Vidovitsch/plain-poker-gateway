const socket = require('socket.io');
const Message = require('./../../models/message');
const RpcMessage = require('./../../models/rpcMessage');

/**
 * [ClientGateway description]
 * @param  {Object} options [description]
 * @constructor
 */
function ClientSocketGateway(options) {
  this.port = options.port || 5000;
  this.io = socket.listen(this.port);
}

const C = ClientSocketGateway.prototype;

/**
 * [description]
 * @param  {Socket}   client   [description]
 * @param  {Function} callback [description]
 */

/**
  * [description]
  * @param  {Socket} client [description]
  * @param  {Lobby} lobby  [description]
  */
C.sendLobbyReply = function sendLobbyReply(client, replyData, requestMessage) {
  const context = 'lobby-reply';
  const replyMessage = new RpcMessage(context, replyData).toReply(requestMessage);
  client.emit(context, JSON.stringify(replyMessage));
  return replyMessage;
};

/**
  * [broadcastLobbyUpdate description]
  * @param  {Object} data [description]
  */
C.broadcastLobbyUpdate = function broadcastLobbyUpdate(data) {
  const context = 'lobby-update';
  const message = new Message(context, data);
  this.io.emit(context, JSON.stringify(message));
  return message;
};

C.onLobbyRequest = function onLobbyRequest(client, callback) {
  client.on('lobby-request', (requestMessage) => {
    callback(JSON.parse(requestMessage.toString()));
  });
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
 * @param  {Socket}   client   [description]
 * @param  {Function} callback [description]
 */
C.onClientDisconnected = function onClientDisconnected(client, callback) {
  client.on('disconnect', () => {
    callback();
  });
};

module.exports = ClientSocketGateway;
