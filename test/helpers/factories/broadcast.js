'use strict';

const stubs = require('../stubs');

/**
 * @see https://github.com/DoSomething/gambit-campaigns/tree/master/documentation
 */

/**
 * @return {Object}
 */
function getValidCampaignBroadcast(date = Date.now()) {
  return {
    id: stubs.getBroadcastId(),
    name: stubs.getBroadcastName(),
    createdAt: date,
    updatedAt: date,
    message: {
      text: stubs.getBroadcastMessageText(),
      attachments: [stubs.getAttachment()],
      template: 'askSignup',
    },
    campaignId: stubs.getCampaignId(),
    topic: null,
  };
}

/**
 * @return {Object}
 */
function getValidTopicBroadcast(date = Date.now()) {
  const broadcast = module.exports.getValidCampaignBroadcast(date);
  broadcast.message.template = 'rivescript';
  broadcast.topic = stubs.getTopic();
  broadcast.campaignId = null;
  return broadcast;
}

module.exports = {
  getValidCampaignBroadcast,
  getValidTopicBroadcast,
};
