const socket = require('socket.io-client');
const util = require('util');

/**
 * [LobbyGateway description]
 * @param       {[type]} options [description]
 * @constructor
 */
function LobbyGateway(options) {
    if (options.websocket) {
        this.socket = socket(util.format(
            'http://%s:%s',
            options.websocket.host,
            options.websocket.port));
    }
}

LobbyGateway.prototype.requestLobby = async function() {
    return new Promise((resolve, reject) => {
        this.socket.emit('lobby-request');
        this.socket.on('lobby-reply', (data) => {
            try {
                resolve(JSON.parse(data.toString('utf8')));
            } catch (ex) {
                reject(ex);
            }
        });
    });
};

LobbyGateway.prototype.onConnected = function(cb) {
    this.socket.on('connect', () => {
        cb();
    });
};

LobbyGateway.prototype.onDisconnected = function(cb) {
    this.socket.on('disconnect', () => {
        cb();
    });
};

module.exports = LobbyGateway;
