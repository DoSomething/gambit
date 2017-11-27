'use strict';

const stubs = require('../stubs');

module.exports.getValidBroadcast = function getValidBroadcast() {
  return {
    sys: {
      id: stubs.getBroadcastId(),
    },
    fields: {
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
