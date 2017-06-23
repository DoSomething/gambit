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
  type: String,
});

/**
 * @param {object} req
 * @param {string} direction
 * @param {string} body
 * @return {Promise}
 */
messageSchema.statics.createForRequest = function (req, data) {
  const user = req.user;
  let type = data.type;
  if (! type) {
    type = null;
  }

  const messageData = {
    userId: user._id,
    direction: data.direction,
    text: data.text,
    topic: user.topic,
    platform: req.body.platform,
    type,
  };

  return this.create(messageData);
};

/**
 * @param {User} user
 * @param {string} body
 * @return {Promise}
 */
messageSchema.statics.createInboundMessage = function (req) {
  const data = {
    direction: 'inbound',
    text: req.body.text,
  };
  return this.createForRequest(req, 'inbound', data);
};

/**
 * @param {User} user
 * @param {string} body
 * @return {Promise}
 */
messageSchema.statics.createOutboundMessage = function (req) {
  const data = {
    direction: 'outbound',
    text: req.reply.text,
    type: req.reply.type,
  };
  return this.createForRequest(req, data);
};

module.exports = mongoose.model('messages', messageSchema);
