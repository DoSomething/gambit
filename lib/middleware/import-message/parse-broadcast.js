'use strict';

const helpers = require('../../helpers');
const logger = require('../../logger');

// TODO: Move inside lib/contentful
function getCampaignId(broadcastObject) {
  const campaign = broadcastObject.fields.campaign;
  if (!campaign.fields) {
    return null;
  }
  return campaign.fields.campaignId;
}

// TODO: Move inside lib/contentful
function getTopic(broadcastObject) {
  return broadcastObject.fields.topic;
}

// TODO: Move inside lib/contentful
function getMessage(broadcastObject) {
  return broadcastObject.fields.message;
}

module.exports = function parseBroadcast() {
  return (req, res, next) => {
    const broadcast = req.broadcast;
    logger.debug('parseBroadcast', { broadcast });

    try {
      req.topic = getTopic(broadcast);
      req.campaignId = getCampaignId(broadcast);
      req.outboundMessageText = getMessage(broadcast);

      return next();
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
