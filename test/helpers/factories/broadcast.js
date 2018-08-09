'use strict';

const stubs = require('../stubs');
const config = require('../../../config/lib/helpers/broadcast');

/**
 * @see https://github.com/DoSomething/gambit-campaigns/tree/master/documentation
 */

function getBroadcast(type) {
  const date = Date.now();
  return {
    id: stubs.getBroadcastId(),
    name: stubs.getBroadcastName(),
    type,
    createdAt: date,
    updatedAt: date,
    message: {
      text: stubs.getBroadcastMessageText(),
      attachments: [stubs.getAttachment()],
      template: type,
    },
    templates: [],
  };
}

function getValidAskSubscriptionStatus() {
  return getBroadcast(config.types.askSubscriptionStatus);
}

function getValidAskYesNo() {
  return module.exports.getBroadcast(config.types.askYesNo);
}

function getValidCampaignBroadcast() {
  const broadcast = getBroadcast(config.types.legacy);
  broadcast.message.template = 'askSignup';
  broadcast.topic = null;
  broadcast.campaignId = stubs.getCampaignId();
  return broadcast;
}

/**
 * @return {Object}
 */
function getValidTopicBroadcast() {
  const broadcast = getBroadcast(config.types.legacy);
  broadcast.message.template = 'rivescript';
  broadcast.topic = stubs.getTopic();
  broadcast.campaignId = null;
  return broadcast;
}

module.exports = {
  getBroadcast,
  getValidAskSubscriptionStatus,
  getValidAskYesNo,
  getValidCampaignBroadcast,
  getValidTopicBroadcast,
};
