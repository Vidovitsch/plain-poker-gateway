const uuidv4 = require('uuid/v4');

/**
 * [Message description]
 */
class Message {
  /**
     * [constructor description]
     * @param {[type]} context [description]
     * @param {[type]} data    [description]
     */
  constructor(context, data) {
    this.id = uuidv4();
    this.type = 'default';
    this.context = context;
    this.timestamp = new Date();
    this.data = data;
  }

  /**
   * [setCurrentTimestamp description]
   */
  setCurrentTimestamp() {
    this.timestamp = new Date();
  }

  /**
   * [toReply description]
   * @param  {[type]} request [description]
   * @return {[type]}         [description]
   */
  toReply(request) {
    this.status = 'reply';
    this.replyTo = request.replyTo;
    this.correlationId = request.correlationId;
    return this;
  }
}

module.exports = Message;
