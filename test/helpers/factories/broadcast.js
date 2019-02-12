'use strict';

const stubs = require('../stubs');
const topicFactory = require('./topic');
const config = require('../../../config/lib/helpers/broadcast');

/**
 * @see https://github.com/DoSomething/gambit-content/tree/master/documentation
 */

function getBroadcast(type, fields = {}) {
  const date = Date.now();
  return {
    id: stubs.getBroadcastId(),
    name: stubs.getBroadcastName(),
    type,
    contentType: type,
    createdAt: date,
    updatedAt: date,
    text: stubs.getBroadcastMessageText(),
    attachments: [stubs.getAttachment()],
    ...fields,
  };
}

function getValidAutoReplyBroadcast() {
  return getBroadcast(config.types.autoReplyBroadcast, { topic: topicFactory.getValidAutoReply() });
}

function getValidAskSubscriptionStatus() {
  return getBroadcast(config.types.askSubscriptionStatus);
}

function getValidAskYesNo() {
  return getBroadcast(config.types.askYesNo, {
    invalidAskYesNoResponse: stubs.getRandomMessageText(),
    saidNo: stubs.getRandomMessageText(),
    saidNoTopic: topicFactory.getValidTopicWithoutCampaign(),
    saidYes: stubs.getRandomMessageText(),
    saidYesTopic: topicFactory.getValidPhotoPostConfig(),
  });
}

function getValidLegacyCampaignBroadcast() {
  const broadcast = getBroadcast(config.types.legacy);
  broadcast.topic = null;
  broadcast.campaignId = stubs.getCampaignId();
  return broadcast;
}

/**
 * @return {Object}
 */
function getValidLegacyRivescriptTopicBroadcast() {
  const broadcast = getBroadcast(config.types.legacy);
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
