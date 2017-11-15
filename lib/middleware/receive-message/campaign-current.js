'use strict';

const logger = require('heroku-logger');
const helpers = require('../../helpers');
const gambitCampaigns = require('../../gambit-campaigns');

module.exports = function getCurrentCampaign() {
  return (req, res, next) => {
    // If we already have a Campaign, user sent a keyword.
    if (req.campaign) {
      return next();
    }

    const campaignId = req.conversation.campaignId;
    logger.debug('getCurrentCampaign',
      helpers.request.injectRequestId({ campaignId }, req));
    if (!campaignId) {
      return next();
    }

    return gambitCampaigns.getCampaignById(campaignId)
      .then((campaign) => {
        req.campaign = campaign;

        return next();
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
