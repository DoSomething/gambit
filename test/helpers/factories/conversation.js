'use strict';

const ObjectID = require('mongoose').Types.ObjectId;

const stubs = require('../stubs');

module.exports.getValidConversation = function getValidConversation(phoneNumber) {
  const id = new ObjectID();
  const date = new Date();
  return {
    id,
    _id: id,
    platform: stubs.getPlatform(),
    platformUserId: phoneNumber || stubs.getMobileNumber(),
    topic: 'random',
    paused: false,
    createdAt: date,
    updatedAt: date,
  };
};
