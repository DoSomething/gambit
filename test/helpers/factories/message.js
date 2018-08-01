'use strict';

const ObjectID = require('mongoose').Types.ObjectId;
const Message = require('../../../app/models/Message');
const stubs = require('../stubs');

module.exports.getRawMessageData = function getRawMessageData(direction) {
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
  };
};

module.exports.getValidMessage = function getValidMessage(direction) {
  return new Message(exports.getRawMessageData(direction));
};

module.exports.getValidOutboundReplyMessage = function getValidOutboundReplyMessage() {
  return exports.getValidMessage('outbound-reply');
};

module.exports.getValidOutboundNoReplyMessage = function getValidOutboundNoReplyMessage() {
  const message = exports.getValidOutboundReplyMessage();
  message.template = 'noReply';
  message.text = '';
  return message;
};
