'use strict';

const stubs = require('../stubs');
const topicFactory = require('./topic');
const config = require('../../../config/lib/helpers/broadcast');

/**
 * @see https://github.com/DoSomething/gambit-campaigns/tree/master/documentation
 */

function getBroadcast(type, topic = {}) {
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
      topic,
    },
    templates: [],
  };
}

function getValidAutoReplyBroadcast() {
  return getBroadcast(config.types.autoReplyBroadcast, topicFactory.getValidAutoReply());
}

function getValidAskSubscriptionStatus() {
  return getBroadcast(config.types.askSubscriptionStatus);
}

function getValidAskYesNo() {
  return module.exports.getBroadcast(config.types.askYesNo);
}

function getValidLegacyCampaignBroadcast() {
  const broadcast = getBroadcast(config.types.legacy);
  broadcast.message.template = 'askSignup';
  broadcast.topic = null;
  broadcast.campaignId = stubs.getCampaignId();
  return broadcast;
}

/**
 * @return {Object}
 */
function getValidLegacyRivescriptTopicBroadcast() {
  const broadcast = getBroadcast(config.types.legacy);
  broadcast.message.template = 'rivescript';
  broadcast.topic = stubs.getTopic();
  broadcast.campaignId = null;
  return broadcast;
}

module.exports = {
  getBroadcast,
  getValidAutoReplyBroadcast,
  getValidAskSubscriptionStatus,
  getValidAskYesNo,
  getValidLegacyCampaignBroadcast,
  getValidLegacyRivescriptTopicBroadcast,
};
