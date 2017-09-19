'use strict';

const logger = require('heroku-logger');
const helpers = require('../../helpers');
const Campaign = require('../../../app/models/Campaign');

module.exports = function getCurrentCampaign() {
  return (req, res, next) => {
    // If we already have a Campaign, user sent a keyword.
    if (req.campaign) {
      return next();
    }

    const campaignId = req.conversation.campaignId;
    logger.debug('getCurrentCampaign', { campaignId });

    // If no Campaign has been set, User has never signed up for a Campaign.
    if (!campaignId) {
      return helpers.noCampaign(req, res);
    }

    return Campaign.findById(campaignId)
      .then((campaign) => {
        if (!campaign) {
          return helpers.noCampaign(req, res);
        }

        req.campaign = campaign;

        return next();
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
