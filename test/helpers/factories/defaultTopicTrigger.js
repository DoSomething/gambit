'use strict';

const stubs = require('../stubs');

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
  getValidRedirectDefaultTopicTrigger,
  getValidReplyDefaultTopicTrigger,
};
