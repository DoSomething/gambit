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
  date: { type: Date, default: Date.now },
  direction: String,
  text: String,
  topic: String,
  campaignId: Number,
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
    userId: req.user._id,
    direction,
    topic: req.user.topic,
    platform: req.body.platform,
  };

  if (direction === 'outbound') {
    message.text = req.reply.text;
    message.template = req.reply.template;
    if (req.campaign) {
      message.campaignId = req.campaign._id;
    }
  } else {
    message.text = req.body.text;
    message.campaignId = req.user.campaignId;
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
