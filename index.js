'use strict'

const ClientGateway = require('./lib/gateways/clientGateway');
const DealerGateway = require('./lib/gateways/dealerGateway');
const LobbyGateway = require('./lib/gateways/lobbyGateway');
const TableGateway = require('./lib/gateways/tableGateway');

function Gateway(options) {
    this.options = options;
}

Gateway.prototype.client = () => {
    return new ClientGateway();
}

module.exports = Gateway;
