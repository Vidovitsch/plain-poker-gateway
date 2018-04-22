const uuidv4 = require('uuid/v4');
const http = require('http');

/**
 * [Message description]
 * @param       {[type]} data [description]
 * @constructor
 */
function Message(data) {
    this.id = uuidv4();
    this.correlationId = '';
    this.dateSent = new Date();
    this.dateReceived = new Date();
    this.getPublicIp().then((pubIp) => {
        this.source = pubIp;
    });
    this.data = data;
}

Message.prototype.getPublicIp = function() {
    return new Promise((resolve, reject) => {
        http.get('http://bot.whatismyipaddress.com', (res) => {
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                resolve(chunk);
            });
        });
    });
};

module.exports = Message;
