const socket = require('socket.io');
const Receiver = require('../services/receiver');
const Sender = require('../services/receiver');

/**
 * [ClientGateway description]
 * @param       {[type]} options [description]
 * @constructor
 */
function ClientGateway(options) {
    if (options.websocket) {
        this.io = socket.listen(options.websocket.port);
    }
    this.receiver = new Receiver(options);
    this.sender = new Sender(options);
}

ClientGateway.prototype.connectToBroker = function() {
    return new Promise((resolve, reject) => {

    });
};

ClientGateway.prototype.onMessage = function(cb) {
    const queue = 'table-default';
    const onConnected = function() {
        this.receiver.bindQueue(queue, 'create-table');
        this.receiver.bindQueue(queue, 'remove-table');
        this.receiver.bindQueue(queue, 'update-table');
        this.receiver.bindQueue(queue, 'join-table');
    };
    this.receiver.startReceiving(queue, (err, message) => {
        if (err) {
            cb(err);
        } else {
            cb(null, message);
        }
    }, onConnected);
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

module.exports = ClientGateway;
