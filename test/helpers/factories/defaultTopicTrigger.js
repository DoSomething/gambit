'use strict';

const stubs = require('../stubs');

function getValidRedirectDefaultTopicTrigger() {
  const data = {
    trigger: stubs.getRandomWord(),
    redirect: stubs.getRandomWord(),
  };
  return data;
}

function getValidReplyDefaultTopicTrigger() {
  const data = {
    trigger: stubs.getRandomWord(),
    reply: stubs.getRandomMessageText(),
  };
  return data;
}

module.exports = {
  getValidRedirectDefaultTopicTrigger,
  getValidReplyDefaultTopicTrigger,
};
