const Receiver = require('../services/receiver');
const Sender = require('../services/receiver');

function ClientGateway(options) {
    //// TODO:
}

ClientGateway.prototype.onLobbyRequest = (client) => {
    return new Promise((resolve, reject) => {
        client.on('lobby-request', (data) => {
            resolve(data);
        });
    });
};

ClientGateway.prototype.onLobbyRequest = (client) => {
    return new Promise((resolve, reject) => {
        client.on('lobby-request', (data) => {
            resolve(data);
        });
    });
};

ClientGateway.prototype.onLobbyRequest = (client) => {
    return new Promise((resolve, reject) => {
        client.on('lobby-request', (data) => {
            resolve(data);
        });
    });
};

module.exports = ClientGateway;
