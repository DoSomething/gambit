'use strict';

const logger = require('heroku-logger');
const Campaigns = require('../../../app/models/Campaign');

module.exports = function getCurrentCampaign() {
  return (req, res, next) => {
    if (req.campaign) {
      return next();
    }

    const campaignId = req.conversation.campaignId;
    if (!req.campaignId) {
      return next();
    }

    return Campaigns.findById(campaignId)
      .then((campaign) => {
        if (!campaign) {
          logger.debug('Campaign not found', { campaignId });

          return next();
        }

        req.campaign = campaign;

        return next();
      });
  };
};
