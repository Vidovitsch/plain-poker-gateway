const ClientGateway = require('./lib/gateways/clientGateway');
const DealerGateway = require('./lib/gateways/dealerGateway');
const LobbyGateway = require('./lib/gateways/lobbyGateway');
const TableGateway = require('./lib/gateways/tableGateway');

exports.createClientGateway = options => new ClientGateway(options);

exports.createDealerGateway = options => new DealerGateway(options);

exports.createLobbyGateway = options => new LobbyGateway(options);

exports.createTableGateway = options => new TableGateway(options);
