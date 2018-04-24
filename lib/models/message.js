const uuidv4 = require('uuid/v4');
const http = require('http');

/**
 * [Message description]
 * @param       {[type]} context [description]
 * @param       {[type]} data    [description]
 * @constructor
 */
function Message(context, data) {
    this.id = uuidv4();
    this.correlationId = uuidv4();
    this.timestampBefore = new Date();
    this.timestampAfter = new Date();
    this.getPublicIp().then((pubIp) => {
        this.source = pubIp;
    });
    this.context = context;
    this.data = data;
    this.isRpc = false;
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
