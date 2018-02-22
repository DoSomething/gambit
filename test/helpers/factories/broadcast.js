'use strict';

const stubs = require('../stubs');

module.exports.getValidCampaignBroadcast = function getValidCampaignBroadcast(date = Date.now()) {
  return {
    sys: {
      id: stubs.getBroadcastId(),
      createdAt: date,
      updatedAt: date,
    },
    fields: {
      name: stubs.getBroadcastName(),
      platform: stubs.getPlatform(),
      topic: null,
      message: stubs.getBroadcastMessageText(),
      campaign: {
        sys: {
          id: '4wg9DK69oAiak446OyAuWA',
        },
        fields: {
          campaignId: stubs.getCampaignId(),
        },
      },
    },
  };
};

module.exports.getValidTopicBroadcast = function getValidTopicBroadcast(date = Date.now()) {
  const broadcast = module.exports.getValidCampaignBroadcast(date);
  broadcast.fields.topic = stubs.getTopic();
  return broadcast;
};
