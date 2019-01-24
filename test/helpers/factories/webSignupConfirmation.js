'use strict';

const stubs = require('../stubs');

function getValidWebSignupConfirmation(campaignId) {
  return {
    campaignId: campaignId || stubs.getRandomNumericId(),
    text: stubs.getRandomMessageText(),
    topic: {
      id: stubs.getContentfulId(),
    },
  };
}

module.exports = {
  getValidWebSignupConfirmation,
};
