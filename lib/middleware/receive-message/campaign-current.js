'use strict';

const logger = require('heroku-logger');
const Campaigns = require('../../../app/models/Campaign');

module.exports = function getCurrentCampaign() {
  return (req, res, next) => {
    if (req.campaign) {
      return next();
    }

    logger.debug('getCurrentCampaign');

    return Campaigns.findById(req.user.campaignId)
      .then((campaign) => {
        if (! campaign) {
          return next();
        }

        req.campaign = campaign;

        return next();
      });
  };
};
