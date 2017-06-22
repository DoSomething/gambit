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
});

/**
 * @param {object} req
 * @param {string} direction
 * @param {string} body
 * @return {Promise}
 */
messageSchema.statics.createForRequestWithDirection = function (req, direction, text) {
  const user = req.user;

  const messageData = {
    userId: user._id,
    direction,
    text,
    topic: user.topic,
    platform: req.body.platform,
  };

  return this.create(messageData);
};

/**
 * @param {User} user
 * @param {string} body
 * @return {Promise}
 */
messageSchema.statics.createInboundMessage = function (req) {
  return this.createForRequestWithDirection(req, 'inbound', req.body.text);
};

/**
 * @param {User} user
 * @param {string} body
 * @return {Promise}
 */
messageSchema.statics.createOutboundMessage = function (req) {
  return this.createForRequestWithDirection(req, 'outbound', req.renderedReplyMessage);
};

module.exports = mongoose.model('messages', messageSchema);
