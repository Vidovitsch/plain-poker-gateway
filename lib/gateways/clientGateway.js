const socket = require('socket.io');
const Receiver = require('../services/receiver');
const Sender = require('../services/sender');

/**
 * [ClientGateway description]
 * @param       {[type]} options [description]
 * @constructor
 */
function ClientGateway(options) {
    if (options.websocket) {
        this.io = socket.listen(options.websocket.port);
    }
    this.receiverConnected = false;
    this.receiver = new Receiver(options);
    this.sender = new Sender(options);
}

ClientGateway.prototype.connectReceiverToBroker = function() {
    return new Promise((resolve, reject) => {
        this.receiver.connect().then(() => {
            this.receiverConnected = true;
            resolve();
        }).catch((err) => {
            reject(err);
        });
    });
};

ClientGateway.prototype.onMessage = function(callback) {
    if (this.receiverConnected) {
        const queue = 'table-default';
        const routingKeys = ['create-table', 'remove-table', 'update-table', 'join-table'];
        this.receiver.createChannel().then((channel) => {
            this.receiver.startReceiving(channel, queue, routingKeys, (err, message) => {
                if (err) {
                    callback(err);
                } else {
                    callback(null, message);
                }
            });
        }).catch((err) => {
            callback(err);
        });
    } else {
        callback('receiver not connected');
    }
};

ClientGateway.prototype.onGameMessage = function(cb) {
    // // TODO:
};

// WebSocket communication //

ClientGateway.prototype.replyLobby = async function(data) {
    this.io.emit('lobby-reply', JSON.stringify(data));
};

ClientGateway.prototype.broadcastUpdate = async function(data) {
    this.io.emit('update-lobby', JSON.stringify(data));
};

ClientGateway.prototype.onClientConnected = function(cb) {
    this.io.on('connection', (client) => {
        cb(client);
    });
};

ClientGateway.prototype.onClientDisconnected = function(client, cb) {
    client.on('disconnect', () => {
        cb();
    });
};

ClientGateway.prototype.onLobbyRequest = function(client, callback) {
    client.on('lobby-request', () => {
        callback();
    });
};

module.exports = ClientGateway;
