const ClientAmqpGateway = require('./lib/gateways/client/clientAmqpGateway');
const ClientSocketGateway = require('./lib/gateways/client/clientSocketGateway');
const DealerAmqpGateway = require('./lib/gateways/dealer/dealerAmqpGateway');
const LobbyAmqpGateway = require('./lib/gateways/lobby/lobbyAmqpGateway');
const LobbySocketGateway = require('./lib/gateways/lobby/lobbySocketGateway');
const TableAmqpGateway = require('./lib/gateways/table/tableAmqpGateway');
const AmqpClient = require('./lib/services/amqpClient');

let amqpClient;

const checkAmqpClient = options => new Promise((resolve, reject) => {
  if (!amqpClient) {
    amqpClient = new AmqpClient(options);
    amqpClient.createSharedConnectionAsync().then(() => {
      resolve();
    }).catch((err) => {
      reject(err);
    });
  } else {
    resolve();
  }
});

exports.getClientGatewayAsync = function getClientGatewayAsync(protocol, options) {
  return new Promise((resolve, reject) => {
    if (protocol === 'amqp') {
      checkAmqpClient(options).then(() => {
        resolve(new ClientAmqpGateway(amqpClient));
      }).catch((err) => {
        reject(err);
      });
    } else if (protocol === 'socket') {
      resolve(new ClientSocketGateway(options));
    } else {
      reject(new Error(`Protocol ${protocol} is invalid, use 'amqp' or 'socket instead'`));
    }
  });
};

exports.getDealerGatewayAsync = function getDealerGatewayAsync(protocol, options) {
  return new Promise((resolve, reject) => {
    if (protocol === 'amqp') {
      checkAmqpClient(options).then(() => {
        resolve(new DealerAmqpGateway(amqpClient));
      }).catch((err) => {
        reject(err);
      });
    } else {
      reject(new Error(`Protocol ${protocol} is invalid, use 'amqp' instead'`));
    }
  });
};

exports.getLobbyGatewayAsync = function getLobbyGatewayAsync(protocol, options) {
  return new Promise((resolve, reject) => {
    if (protocol === 'amqp') {
      checkAmqpClient(options).then(() => {
        resolve(new LobbyAmqpGateway(amqpClient));
      }).catch((err) => {
        reject(err);
      });
    } else if (protocol === 'socket') {
      resolve(new LobbySocketGateway(options));
    } else {
      reject(new Error(`Protocol ${protocol} is invalid, use 'amqp' or 'socket instead'`));
    }
  });
};

exports.getTableGatewayAsync = function getTableAmqpGatewayAsync(protocol, options) {
  return new Promise((resolve, reject) => {
    if (protocol === 'amqp') {
      checkAmqpClient(options).then(() => {
        resolve(new TableAmqpGateway(amqpClient));
      }).catch((err) => {
        reject(err);
      });
    } else {
      reject(Error(`Protocol ${protocol} is invalid, use 'amqp'`));
    }
  });
};

exports.closeSharedConnection = function closeSharedConnection() {
  if (amqpClient) {
    return amqpClient.closeSharedConnection();
  }
  return new Error('amqpClient is not initialized');
};
