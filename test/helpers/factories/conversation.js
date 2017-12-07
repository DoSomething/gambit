'use strict';

const ObjectID = require('mongoose').Types.ObjectId;
const Conversation = require('../../../app/models/Conversation');
const stubs = require('../stubs');

module.exports.getValidConversation = function getValidConversation(phoneNumber) {
  const id = new ObjectID();
  const date = new Date();
  return new Conversation({
    id,
    _id: id,
    platform: stubs.getPlatform(),
    platformUserId: phoneNumber || stubs.getMobileNumber(),
    topic: stubs.getTopic(),
    paused: false,
    createdAt: date,
    updatedAt: date,
  });
};
