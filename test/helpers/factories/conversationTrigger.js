'use strict';

const stubs = require('../stubs');

function getValidConversationTrigger() {
  return {
    trigger: stubs.getRandomWord(),
    reply: stubs.getRandomMessageText(),
  };
}

module.exports = {
  getValidConversationTrigger,
};
