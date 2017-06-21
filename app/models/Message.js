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
  type: String,
  body: String,
  topic: String,
  campaignId: Number,
  signupStatus: String,
});

/**
 * @param {User} user
 * @param {string} direction
 * @param {string} body
 * @return {Promise}
 */
messageSchema.statics.createForUser = function (user, direction, body) {
  const messageData = {
    direction,
    body,
    userId: user._id,
    topic: user.topic,
    campaignId: user.campaignId,
    signupStatus: user.signupStatus,
  };

  return this.create(messageData);
};

/**
 * @param {User} user
 * @param {string} body
 * @return {Promise}
 */
messageSchema.statics.createInboundMessage = function (user, body) {
  return this.createForUser(user, 'inbound', body);
};

/**
 * @param {User} user
 * @param {string} body
 * @return {Promise}
 */
messageSchema.statics.createOutboundMessage = function (user, body) {
  return this.createForUser(user, 'outbound', body);
};

module.exports = mongoose.model('messages', messageSchema);
