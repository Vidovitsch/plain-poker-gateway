const Message = require('./message');
const uuidv4 = require('uuid/v4');

/**
 * [RpcMessage description]
 * @extends Message
 */
class RpcMessage extends Message {
  /**
   * [constructor description]
   * @param {String} context [description]
   * @param {Object} data    [description]
   */
  constructor(context, data) {
    super(context, data);
    this.type = 'rpc';
    this.correlationId = uuidv4();
    this.replyTo = '';
    this.status = 'request';
  }

  /**
   * [setReplyTo description]
   * @param {String} replyTo [description]
   */
  setReplyTo(replyTo) {
    this.replyTo = replyTo;
  }
}

module.exports = {
  /**
   * [createInstance description]
   * @param  {String} context [description]
   * @param  {Object} data    [description]
   * @return {RpcMessage}         [description]
   * @return {Error}         [description]
   */
  createInstance(context, data) {
    if (!context) {
      throw new Error('Invalid argument(s)');
    }
    return new RpcMessage(context, data);
  },
};
