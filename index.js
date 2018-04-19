'use strict'

const ClientGateway = require('./lib/gateways/clientGateway');
const DealerGateway = require('./lib/gateways/dealerGateway');
const LobbyGateway = require('./lib/gateways/lobbyGateway');
const TableGateway = require('./lib/gateways/tableGateway');

module.exports = (options) => {
    this.client = () => {
        return new ClientGateway();
    };
    this.dealer = () => {
        return new DealerGateway();
    };
    this.lobby = () => {
        return new LobbyGateway();
    };
    this.table = () => {
        return new TableGateway();
    };
}
