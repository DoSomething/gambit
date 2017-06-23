'use strict';

const mongoose = require('mongoose');

/**
 * Schema.
 */
const messageSchema = new mongoose.Schema({
  userId: {
    type: String,
    index: true,
  },
  direction: String,
  text: String,
  topic: String,
  platform: String,
  template: String,
});

/**
 * @param {object} req
 * @param {string} direction
 * @param {string} body
 * @return {Promise}
 */
messageSchema.statics.createForRequest = function (req, direction) {
  const message = {
    userId: req.userId,
    direction: direction,
    topic: req.user.topic,
    platform: req.body.platform,
  };

  if (direction === 'outbound') {
    message.text = req.reply.text;
    message.template = req.reply.type;
  } else {
    message.text = req.body.text;
  }

  return this.create(message);
};

/**
 * @param {User} user
 * @param {string} body
 * @return {Promise}
 */
messageSchema.statics.createInboundMessage = function (req) {
  return this.createForRequest(req, 'inbound');
};

/**
 * @param {User} user
 * @param {string} body
 * @return {Promise}
 */
messageSchema.statics.createOutboundMessage = function (req) {
  return this.createForRequest(req, 'outbound');
};

module.exports = mongoose.model('messages', messageSchema);
