const socket = require('socket.io');

const Receiver = require('../services/receiver');
const Sender = require('../services/receiver');

/**
 * [ClientGateway description]
 * @param       {[type]} options [description]
 * @constructor
 */
function ClientGateway(options) {
    this.options = options || {};
    if (options.websocket) {
        console.log(options.websocket);
        this.io = socket.listen(options.websocket.port);
        console.log(this.io);
    }
    if (options.amqp) {
        // TODO: implement option handlers
    }
}

// WebSocket communication //

ClientGateway.prototype.broadcastUpdate = async (data) => {
    this.io.emit('update-lobby', data);
}

ClientGateway.prototype.onClientConnected = () => {
    console.log(this.io);
    return new Promise((resolve, reject) => {
        console.log(this.io);
        this.io.on('connection', (client) => {
            resolve(client);
        });
    });
}

ClientGateway.prototype.onClientDisconnected = (client) => {
    return new Promise((resolve, reject) => {
        client.on('disconnect', () => {
            resolve(client);
        });
    });
}

ClientGateway.prototype.onLobbyRequest = (client) => {
    return new Promise((resolve, reject) => {
        client.on('request-lobby', (data) => {
            resolve(data);
        });
    });
};

ClientGateway.prototype.onCreateTable = (client) => {
    return new Promise((resolve, reject) => {
        client.on('create-table', (data) => {
            resolve(data);
        });
    });
};

ClientGateway.prototype.onRemoveTable = (client) => {
    return new Promise((resolve, reject) => {
        client.on('remove-table', (data) => {
            resolve(data);
        });
    });
};

ClientGateway.prototype.onUpdateTable = (client) => {
    return new Promise((resolve, reject) => {
        client.on('update-table', (data) => {
            resolve(data);
        });
    });
};

ClientGateway.prototype.onJoinTable = (client) => {
    return new Promise((resolve, reject) => {
        client.on('join-table', (data) => {
            resolve(data);
        });
    });
};

module.exports = ClientGateway;
