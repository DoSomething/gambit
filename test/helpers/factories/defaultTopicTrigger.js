'use strict';

const stubs = require('../stubs');

function getValidChangeTopicDefaultTopicTrigger() {
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
  getValidChangeTopicDefaultTopicTrigger,
  getValidRedirectDefaultTopicTrigger,
  getValidReplyDefaultTopicTrigger,
};
