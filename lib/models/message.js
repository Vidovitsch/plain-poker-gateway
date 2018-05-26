const uuidv4 = require('uuid/v4');

/**
 * [Message description]
 */
class Message {
  /**
   * [constructor description]
   * @param {String} context [description]
   * @param {Object} data    [description]
   */
  constructor(context, data) {
    this.id = uuidv4();
    this.type = 'default';
    this.context = context;
    this.timestamp = new Date();
    this.data = data;
    this.hasErrors = false;
  }

  /**
   * [setCurrentTimestamp description]
   */
  setCurrentTimestamp() {
    this.timestamp = new Date();
  }

  /**
 * [toError description]
 * @param  {Error} error [description]
 * @return {Message}       [description]
 */
  toError() {
    this.hasErrors = true;
    this.data = this.data.message;
    return this;
  }

  /**
   * [toReply description]
   * @param  {RpcMessage} request [description]
   * @return {Message}         [description]
   */
  toReply(request) {
    this.status = 'reply';
    this.replyTo = request.replyTo;
    this.correlationId = request.correlationId;
    return this;
  }
}

module.exports = Message;
