'use strict';

const moment = require('moment');

const Message = require('../../../app/models/Message');
const Conversation = require('../../../app/models/Conversation');

const conversationFactory = require('../factories/conversation');
const messageFactory = require('../factories/message');

module.exports.seed = {};

exports.seed.messages = async function messages(qty = 1) {
  let generated = 0;
  const limit = 10;
  const messageObjects = [];

  while (generated < qty && generated < limit) {
    messageObjects.push(messageFactory.getRawMessageData());
    generated += 1;
  }
  return Message.create(messageObjects);
};

exports.seed.conversations = async function conversations(qty = 1) {
  let generated = 0;
  const limit = 10;
  const conversationObjects = [];

  while (generated < qty && generated < limit) {
    conversationObjects.push(conversationFactory.getRawConversationData());
    generated += 1;
  }
  return Conversation.create(conversationObjects);
};

exports.seed.generalConvoInteraction = async function generalConvoInteraction() {
  const conversation = conversationFactory.getValidConversation();
  const inboundMessage = messageFactory.getValidMessage();
  const outboundMessage = messageFactory.getValidOutboundReplyMessage();

  // Link outbound message to conversation
  conversation.lastOutboundMessage = outboundMessage;

  // Link Conversation to messages
  inboundMessage.conversationId = conversation;
  outboundMessage.conversationId = conversation;

  // Make sure outbound has a default metadata
  // TODO: I think this should be done directly in the factory
  outboundMessage.metadata = {
    delivery: {
      queuedAt: moment().subtract(3, 'days').format(),
    },
  };

  await conversation.save();
  await inboundMessage.save();
  await outboundMessage.save();

  return { conversation, inboundMessage, outboundMessage };
};
