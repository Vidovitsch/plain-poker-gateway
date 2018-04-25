'use strict';

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
}

module.exports = Message;
