const ClientAmqpGateway = require('./lib/gateways/client/clientAmqpGateway');
const ClientSocketGateway = require('./lib/gateways/client/clientSocketGateway');
const DealerAmqpGateway = require('./lib/gateways/dealer/dealerAmqpGateway');
const LobbyAmqpGateway = require('./lib/gateways/lobby/lobbyAmqpGateway');
const LobbySocketGateway = require('./lib/gateways/lobby/lobbySocketGateway');
const TableAmqpGateway = require('./lib/gateways/table/tableAmqpGateway');
const TableGameAmqpGateway = require('./lib/gateways/table/tableGameAmqpGateway');
const ClientGameAmqpGateway = require('./lib/gateways/client/clientGameAmqpGateway');
const DealerGameAmqpGateway = require('./lib/gateways/dealer/dealerGameAmqpGateway');
const AmqpClient = require('./lib/services/amqpClient');

module.exports = args => ({
  /**
   * [getClientGateway description]
   * @param  {String} protocol [description]
   * @return {clientAmqpGateway}          [description]
   * @return {clientSocketGateway}          [description]
   * @return {Error}          [description]
   */
  getClientGateway: (protocol) => {
    if (protocol === 'amqp') {
      return ClientAmqpGateway.createInstance(AmqpClient.getInstance(args.amqp));
    } else if (protocol === 'ws') {
      return ClientSocketGateway.createInstance(args.ws);
    }
    return new Error(`Protocol ${protocol} is invalid, use 'amqp' or 'socket instead'`);
  },

  /**
   * [getDealerGateway description]
   * @param  {String} protocol [description]
   * @return {DealerAmqpGateway}          [description]
   * @return {Error}          [description]
   */
  getDealerGateway: (protocol) => {
    if (protocol === 'amqp') {
      return DealerAmqpGateway.createInstance(AmqpClient.getInstance(args.amqp));
    }
    return new Error(`Protocol ${protocol} is invalid, use 'amqp'`);
  },

  /**
   * [getLobbyGateway description]
   * @param  {String} protocol [description]
   * @return {LobbyAmqpGateway}          [description]
   * @return {LobbySocketGateway}          [description]
   * @return {Error}          [description]
   */
  getLobbyGateway: (protocol) => {
    if (protocol === 'amqp') {
      return LobbyAmqpGateway.createInstance(AmqpClient.getInstance(args.amqp));
    } else if (protocol === 'ws') {
      return LobbySocketGateway.createInstance(args.ws);
    }
    return new Error(`Protocol ${protocol} is invalid, use 'amqp' or 'socket instead'`);
  },

  /**
   * [getTableGateway description]
   * @param  {String} protocol [description]
   * @return {TableAmqpGateway}          [description]
   * @return {Error}          [description]
   */
  getTableGateway: (protocol) => {
    if (protocol === 'amqp') {
      return TableAmqpGateway.createInstance(AmqpClient.getInstance(args.amqp));
    }
    return new Error(`Protocol ${protocol} is invalid, use 'amqp'`);
  },

  /**
   * [getTableGameGateway description]
   * @param  {String} protocol    [description]
   * @return {TableGameAmqpGateway}             [description]
   * @return {Error}          [description]
   */
  getTableGameGateway: (protocol) => {
    if (protocol === 'amqp') {
      return TableGameAmqpGateway.createInstance(AmqpClient.getInstance(args.amqp));
    }
    return new Error(`Protocol ${protocol} is invalid, use 'amqp'`);
  },

  /**
   * [getClientGameGateway description]
   * @param  {String} protocol [description]
   * @return {ClientGameAmqpGateway}          [description]
   * @return {Error}          [description]
   */
  getClientGameGateway: (protocol) => {
    if (protocol === 'amqp') {
      return ClientGameAmqpGateway.createInstance(AmqpClient.getInstance(args.amqp));
    }
    return new Error(`Protocol ${protocol} is invalid, use 'amqp'`);
  },

  /**
   * [getDealerGameGateway description]
   * @param  {String} protocol [description]
   * @return {DealerGameAmqpGateway}          [description]
   * @return {Error}          [description]
   */
  getDealerGameGateway: (protocol) => {
    if (protocol === 'amqp') {
      return DealerGameAmqpGateway.createInstance(AmqpClient.getInstance(args.amqp));
    }
    return new Error(`Protocol ${protocol} is invalid, use 'amqp'`);
  },

  /**
   * [createSharedConnectionAsync description]
   * @param  {String} key [description]
   * @return {Promise}     [description]
   */
  createSharedConnectionAsync: key => new Promise((resolve, reject) => {
    AmqpClient.getInstance(args.amqp).createSharedConnectionAsync(key).then(() => {
      resolve();
    }).catch((err) => {
      reject(err);
    });
  }),

  /**
   * [createSharedChannelAsync description]
   * @param  {String} key           [description]
   * @param  {String} connectionKey [description]
   * @return {Promise}               [description]
   */
  createSharedChannelAsync: (key, connectionKey) => new Promise((resolve, reject) => {
    AmqpClient.getInstance(args.amqp).createSharedChannelAsync(key, connectionKey).then(() => {
      resolve();
    }).catch((err) => {
      reject(err);
    });
  }),

  /**
   * [closeSharedConnection description]
   * @param  {String} key [description]
   */
  closeSharedConnection: (key) => {
    AmqpClient.getInstance(args.amqp).closeSharedConnection(key);
  },

  /**
   * [closeSharedChannel description]
   * @param  {String} key [description]
   */
  closeSharedChannel: (key) => {
    AmqpClient.getInstance(args.amqp).closeSharedChannel(key);
  },
});
