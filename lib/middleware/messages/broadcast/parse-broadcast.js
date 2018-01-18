'use strict';

const helpers = require('../../../helpers');
const contentful = require('../../../contentful');

module.exports = function parseBroadcast() {
  return (req, res, next) => {
    const broadcast = req.broadcast;

    try {
      req.topic = contentful.getTopicFromBroadcast(broadcast);
      req.campaignId = contentful.getCampaignIdFromBroadcast(broadcast);
      req.outboundMessageText = contentful.getMessageTextFromBroadcast(broadcast);

      helpers.analytics.addParameters({
        broadcastTopic: req.topic,
        broadcastCampaignId: req.campaignId,
      });

      return next();
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
