'use strict';

const stubs = require('../stubs');

module.exports.getValidBroadcast = function getValidBroadcast(date = Date.now()) {
  return {
    sys: {
      id: stubs.getBroadcastId(),
      createdAt: date,
      updatedAt: date,
    },
    fields: {
      name: stubs.getBroadcastName(),
      platform: stubs.getPlatform(),
      topic: stubs.getTopic(),
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
