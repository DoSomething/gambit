'use strict';

const ObjectID = require('mongoose').Types.ObjectId;
const Conversation = require('../../../app/models/Conversation');
const messageFactory = require('./message');
const stubs = require('../stubs');

module.exports.getRawConversationData = function getRawConversationData(platformString) {
  const platform = platformString || stubs.getPlatform();
  const id = new ObjectID();
  const date = new Date();

  return {
    id,
    _id: id,
    platform,
    userId: stubs.getUserId(),
    platformUserId: stubs.getMobileNumber(),
    topic: stubs.getTopic(),
    createdAt: date,
    updatedAt: date,
    lastOutboundMessage: messageFactory.getValidMessage(),
    campaignId: stubs.getCampaignId(),
  };
};

module.exports.getValidConversation = function getValidConversation(platformString) {
  return new Conversation(exports.getRawConversationData(platformString));
};

module.exports.getValidSupportConversation = function getValidSupportConversation() {
  const conversation = module.exports.getValidConversation();
  conversation.topic = 'support';
  conversation.lastOutboundMessage = messageFactory.getValidOutboundNoReplyMessage();
  return conversation;
};
