'use strict';

const stubs = require('../stubs');

function getValidWebSignupConfirmation(campaign) {
  return {
    campaign,
    text: stubs.getRandomMessageText(),
    topic: {
      id: stubs.getContentfulId(),
    },
  };
}

module.exports = {
  getValidWebSignupConfirmation,
};
