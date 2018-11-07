'use strict';

const stubs = require('../stubs');

function getLegacyChangeTopicDefaultTopicTrigger() {
  return {
    trigger: stubs.getRandomWord(),
    topic: {
      id: stubs.getContentfulId(),
    },
  };
}

function getValidRedirectDefaultTopicTrigger() {
  return {
    trigger: stubs.getRandomWord(),
    redirect: stubs.getRandomWord(),
  };
}

function getValidReplyDefaultTopicTrigger() {
  return {
    trigger: stubs.getRandomWord(),
    reply: stubs.getRandomMessageText(),
  };
}

module.exports = {
  getLegacyChangeTopicDefaultTopicTrigger,
  getValidRedirectDefaultTopicTrigger,
  getValidReplyDefaultTopicTrigger,
};
