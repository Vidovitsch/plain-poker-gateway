'use strict'

const ClientGateway = require('./lib/gateways/clientGateway');
const DealerGateway = require('./lib/gateways/dealerGateway');
const LobbyGateway = require('./lib/gateways/lobbyGateway');
const TableGateway = require('./lib/gateways/tableGateway');

exports.createClientGateway = (options) => {
    return new ClientGateway(options);
}

exports.createDealerGateway = (options) => {
    return new DealerGateway(options);
}

exports.createLobbyGateway = (options) => {
    return new LobbyGateway(options);
}

exports.createTableGateway = (options) => {
    return new TableGateway(options);
}
