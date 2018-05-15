const ClientAmqpGateway = require('./lib/gateways/client/clientAmqpGateway');
const ClientSocketGateway = require('./lib/gateways/client/clientSocketGateway');
const DealerAmqpGateway = require('./lib/gateways/dealer/dealerAmqpGateway');
const LobbyAmqpGateway = require('./lib/gateways/lobby/lobbyAmqpGateway');
const LobbySocketGateway = require('./lib/gateways/lobby/lobbySocketGateway');
const TableAmqpGateway = require('./lib/gateways/table/tableAmqpGateway');
const GameAmqpGateway = require('./lib/gateways/table/gameAmqpGateway');
const ClientGameAmqpGateway = require('./lib/gateways/client/clientGameAmqpGateway');
const AmqpClient = require('./lib/services/amqpClient');

let amqpClient;

const getAmqpClientInstance = (options) => {
  if (!amqpClient) {
    amqpClient = new AmqpClient(options);
  }
  return amqpClient;
};

module.exports = args => ({
  getClientGateway: (protocol) => {
    if (protocol === 'amqp') {
      return new ClientAmqpGateway(getAmqpClientInstance(args.amqp));
    } else if (protocol === 'ws') {
      return new ClientSocketGateway(args.ws);
    }
    return new Error(`Protocol ${protocol} is invalid, use 'amqp' or 'socket instead'`);
  },
  getDealerGateway: (protocol) => {
    if (protocol === 'amqp') {
      return new DealerAmqpGateway(getAmqpClientInstance(args.amqp));
    }
    return new Error(`Protocol ${protocol} is invalid, use 'amqp'`);
  },
  getLobbyGateway: (protocol) => {
    if (protocol === 'amqp') {
      return new LobbyAmqpGateway(getAmqpClientInstance(args.amqp));
    } else if (protocol === 'ws') {
      return new LobbySocketGateway(args.ws);
    }
    return new Error(`Protocol ${protocol} is invalid, use 'amqp' or 'socket instead'`);
  },
  getTableGateway: (protocol) => {
    if (protocol === 'amqp') {
      return new TableAmqpGateway(getAmqpClientInstance(args.amqp));
    }
    return new Error(`Protocol ${protocol} is invalid, use 'amqp'`);
  },
  getGameGateway: (protocol) => {
    if (protocol === 'amqp') {
      return new GameAmqpGateway(getAmqpClientInstance(args.amqp));
    }
    return new Error(`Protocol ${protocol} is invalid, use 'amqp'`);
  },
  getClientGameGateway: (protocol) => {
    if (protocol === 'amqp') {
      return new ClientGameAmqpGateway(getAmqpClientInstance(args.amqp));
    }
    return new Error(`Protocol ${protocol} is invalid, use 'amqp'`);
  },
  createSharedConnectionAsync: key => new Promise((resolve, reject) => {
    getAmqpClientInstance(args.amqp).createSharedConnectionAsync(key).then(() => {
      resolve();
    }).catch((err) => {
      reject(err);
    });
  }),
  createSharedChannelAsync: (key, connectionKey) => new Promise((resolve, reject) => {
    getAmqpClientInstance(args.amqp).createSharedChannelAsync(key, connectionKey).then(() => {
      resolve();
    }).catch((err) => {
      reject(err);
    });
  }),
  closeSharedConnection: (key) => {
    getAmqpClientInstance(args.amqp).closeSharedConnection(key);
  },
});
