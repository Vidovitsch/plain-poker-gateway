const Message = require('./message');
const uuidv4 = require('uuid/v4');

/**
 * [RpcMessage description]
 * @extends Message
 */
class RpcMessage extends Message {
  /**
     * [constructor description]
     * @param {[type]} context [description]
     * @param {[type]} data    [description]
     */
  constructor(context, data) {
    super(context, data);
    this.type = 'rpc';
    this.correlationId = uuidv4();
    this.replyTo = '';
    this.status = 'request';
  }

  setReplyTo(replyTo) {
    this.replyTo = replyTo;
  }
}

module.exports = {
  createInstance(context, data) {
    if (!context) {
      throw new Error('Invalid argument(s)');
    }
    return new RpcMessage(context, data);
  },
};
