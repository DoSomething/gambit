'use strict';

const stubs = require('../stubs');
const topicFactory = require('./topic');
const config = require('../../../config/lib/helpers/broadcast');

/**
 * @see https://github.com/DoSomething/gambit-content/tree/master/documentation
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
  const broadcast = getBroadcast(config.types.askYesNo);
  broadcast.templates = {
    saidYes: {
      text: stubs.getRandomMessageText(),
      topic: topicFactory.getValidAutoReply(),
    },
    saidNo: {
      text: stubs.getRandomMessageText(),
      topic: topicFactory.getValidTopicWithoutCampaign(),
    },
  };
  return broadcast;
}

function getValidAskVotingPlanStatus() {
  const broadcast = getBroadcast(config.types.askVotingPlanStatus);
  broadcast.templates = {
    votingPlanStatusCantVote: {
      text: stubs.getRandomMessageText(),
      topic: topicFactory.getValidAutoReply(),
    },
    votingPlanStatusNotVoting: {
      text: stubs.getRandomMessageText(),
      topic: topicFactory.getValidTopicWithoutCampaign(),
    },
    votingPlanStatusVoted: {
      text: stubs.getRandomMessageText(),
      topic: topicFactory.getValidTopicWithoutCampaign(),
    },
  };
  return broadcast;
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
  getValidAskVotingPlanStatus,
  getValidAskYesNo,
  getValidLegacyCampaignBroadcast,
  getValidLegacyRivescriptTopicBroadcast,
};
