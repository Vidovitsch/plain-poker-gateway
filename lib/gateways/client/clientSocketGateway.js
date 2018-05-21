const socket = require('socket.io');
const Message = require('./../../models/message');
const RpcMessage = require('./../../models/rpcMessage');
const debug = require('debug')('ws');

// Singleton support
let instance = null;

/**
 * [ClientSocketGateway description]
 * @param       {Object} options [description]
 * @constructor
 */
function ClientSocketGateway(options) {
  this.port = options.port || 5000;
  this.io = socket.listen(this.port);
}

const C = ClientSocketGateway.prototype;

/**
 * [sendLobbyReply description]
 * @param  {Object} client         [description]
 * @param  {Object} replyData      [description]
 * @param  {RpcMessage} requestMessage [description]
 * @return {RpcMessage}                [description]
 */
C.sendLobbyReply = function sendLobbyReply(client, replyData, requestMessage) {
  const context = 'lobby-reply';
  const replyMessage = RpcMessage.createInstance(context, replyData).toReply(requestMessage);
  client.emit(context, JSON.stringify(replyMessage));
  debug(`(default) Message sent => [destination:${client.id}], [context:${context}]`);
  return replyMessage;
};

/**
 * [broadcastLobbyUpdate description]
 * @param  {Ojbect} data [description]
 * @return {Message}      [description]
 */
C.broadcastLobbyUpdate = function broadcastLobbyUpdate(data) {
  const context = 'lobby-update';
  const message = new Message(context, data);
  this.io.emit(context, JSON.stringify(message));
  debug(`(broadcast) Message sent => [context:${context}]`);
  return message;
};

/**
 * [onLobbyRequest description]
 * @param  {Object}   client   [description]
 * @param  {Function} callback [description]
 */
C.onLobbyRequest = function onLobbyRequest(client, callback) {
  client.on('lobby-request', (requestMessage) => {
    const parsedMessage = JSON.parse(requestMessage.toString());
    debug(`Message received => [origin:${client.id}], [context:${parsedMessage.context}]`);
    callback(parsedMessage);
  });
};

/**
 * [onClientConnected description]
 * @param  {Function} callback [description]
 */
C.onClientConnected = function onClientConnected(callback) {
  this.io.on('connection', (client) => {
    debug(`Client connected => [client:${client.id}]`);
    callback(client);
  });
};

/**
 * [onClientDisconnected description]
 * @param  {Object}   client   [description]
 * @param  {Function} callback [description]
 */
C.onClientDisconnected = function onClientDisconnected(client, callback) {
  client.on('disconnect', () => {
    debug(`Client disconnected => [client:${client.id}]`);
    callback();
  });
};

module.exports = {
  /**
   * [getInstance description]
   * @param  {Object} options [description]
   * @return {ClientSocketGateway}         [description]
   * @return {Error}         [description]
   */
  getInstance(options) {
    if (!instance) {
      if (!options) {
        throw new Error('Invalid argument(s)');
      }
      instance = new ClientSocketGateway(options);
    }
    return instance;
  },
};
