'use strict';

const ObjectID = require('mongoose').Types.ObjectId;
const Conversation = require('../../../app/models/Conversation');
const messageFactory = require('./message');
const stubs = require('../stubs');

const config = require('../../../config/app/models/conversation');

module.exports.getValidConversation = function getValidConversation(platformString) {
  let platform = platformString;
  if (!platform) {
    platform = stubs.getPlatform();
  }
  const id = new ObjectID();
  const date = new Date();
  return new Conversation({
    id,
    _id: id,
    platform,
    userId: stubs.getUserId(),
    platformUserId: stubs.getMobileNumber(),
    topic: stubs.getTopic(),
    createdAt: date,
    updatedAt: date,
    lastOutboundMessage: messageFactory.getValidMessage(),
  });
};

module.exports.getValidSupportConversation = function getValidSupportConversation() {
  const conversation = module.exports.getValidConversation();
  conversation.topic = config.topics.support;
  conversation.lastOutboundMessage = messageFactory.getValidOutboundNoReplyMessage();
  return conversation;
};
