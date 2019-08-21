'use strict';

const ObjectID = require('mongoose').Types.ObjectId;
const Message = require('../../../app/models/Message');
const stubs = require('../stubs');

module.exports.getRawMessageData = function (direction, conversationId) {
  const id = new ObjectID();
  const date = new Date();
  return {
    _id: id,
    createdAt: date,
    updatedAt: date,
    text: stubs.getRandomMessageText(),
    direction: direction || 'inbound',
    template: stubs.getTemplate(),
    broadcastId: stubs.getBroadcastId(),
    userId: stubs.getUserId(),
    macro: stubs.getMacro(),
    conversationId: conversationId || new ObjectID(),
  };
};

module.exports.getValidMessage = function (direction, conversationId) {
  return new Message(exports.getRawMessageData(direction, conversationId));
};

module.exports.getValidOutboundReplyMessage = function (conversationId) {
  return exports.getValidMessage('outbound-reply', conversationId);
};

module.exports.getValidOutboundNoReplyMessage = function (conversationId) {
  const message = exports.getValidOutboundReplyMessage(conversationId);
  message.template = 'noReply';
  message.text = '';
  return message;
};
