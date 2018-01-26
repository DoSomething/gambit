'use strict';

const helpers = require('../../../helpers');

module.exports = function parseBroadcast() {
  return (req, res, next) => {
    const broadcast = req.broadcast;

    try {
      const data = helpers.broadcast.parseBroadcast(broadcast);
      req.topic = data.topic;
      req.campaignId = data.campaignId;
      req.outboundMessageText = data.message;
      req.platform = data.platform;
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
