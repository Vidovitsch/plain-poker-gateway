const Message = require('./message');

/**
 * [errMessage description]
 * @extends Message
 */
class ErrorMessage extends Message {
  /**
     * [constructor description]
     * @param {[type]} context [description]
     * @param {[type]} error   [description]
     */
  constructor(context, error) {
    super(context, null);
    this.type = 'error';
    this.error = error;
  }
}

module.exports = ErrorMessage;
