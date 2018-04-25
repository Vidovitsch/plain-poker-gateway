'use strict';

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
        this.correlationId = uuidv4(),
        this.replyTo = '';
        this.status = 'request';
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

module.exports = RpcMessage;
