const ClientAmqpGateway = require('./lib/gateways/client/clientAmqpGateway');
const ClientSocketGateway = require('./lib/gateways/client/clientSocketGateway');
const DealerAmqpGateway = require('./lib/gateways/dealer/dealerAmqpGateway');
const LobbyAmqpGateway = require('./lib/gateways/lobby/lobbyAmqpGateway');
const LobbySocketGateway = require('./lib/gateways/lobby/lobbySocketGateway');
const TableAmqpGateway = require('./lib/gateways/table/tableAmqpGateway');

exports.getClientGateway = function getClientGateway(protocol, options) {
  if (protocol === 'amqp') {
    return new ClientAmqpGateway(options);
  } else if (protocol === 'socket') {
    return new ClientSocketGateway(options);
  }
  return new Error(`Protocol ${protocol} is invalid, use 'amqp' or 'socket instead'`);
};

exports.getDealerGateway = function getDealerGateway(protocol, options) {
  if (protocol === 'amqp') {
    return new DealerAmqpGateway(options);
  }
  return new Error(`Protocol ${protocol} is invalid, use 'amqp' instead'`);
};

exports.getLobbyGateway = function getLobbyGateway(protocol, options) {
  if (protocol === 'amqp') {
    return new LobbyAmqpGateway(options);
  } else if (protocol === 'socket') {
    return new LobbySocketGateway(options);
  }
  return new Error(`Protocol ${protocol} is invalid, use 'amqp' or 'socket instead'`);
};

exports.getTableAmqpGateway = function getTableAmqpGateway(protocol, options) {
  if (protocol === 'amqp') {
    return new TableAmqpGateway(options);
  }
  return new Error(`Protocol ${protocol} is invalid, use 'amqp'`);
};
