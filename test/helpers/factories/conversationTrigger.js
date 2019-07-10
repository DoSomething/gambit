'use strict';

const stubs = require('../stubs');

function getValidConversationTrigger(type) {
  return {
    trigger: stubs.getRandomWord(),
    /**
     * askMultipleChoice, faqAnswer, photoPostTransition, textPostTransition
     * or autoReplyTransition
     */
    response: {
      contentType: type || 'photoPostTransition',
      text: stubs.getRandomMessageText(),
      topic: {},
    },
  };
}

module.exports = {
  getValidConversationTrigger,
};
