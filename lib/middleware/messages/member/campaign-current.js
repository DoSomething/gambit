'use strict';

const logger = require('../../../logger');
const helpers = require('../../../helpers');

module.exports = function getCurrentCampaign() {
  return (req, res, next) => {
    // If we already have a Campaign, user sent a keyword.
    if (req.campaign) {
      return next();
    }

    const campaignId = req.conversation.campaignId;
    logger.debug('getCurrentCampaign', { campaignId }, req);
    if (!campaignId) {
      return next();
    }

    return helpers.campaign.fetchById(campaignId)
      .then((campaign) => {
        helpers.request.setCampaign(req, campaign);
        return next();
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
