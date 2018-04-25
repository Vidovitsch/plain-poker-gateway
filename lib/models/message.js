const uuidv4 = require('uuid/v4');

/**
 * [Message description]
 * @param       {[type]} data    [description]
 * @constructor
 */
function Message(data) {
    this.id = uuidv4();
    this.timestamp = new Date();
    this.context = '';
    this.properties = {
        isRpc: false,
        correlationId: uuidv4(),
        replyTo: '',
    };
    this.data = data;
}

module.exports = Message;
