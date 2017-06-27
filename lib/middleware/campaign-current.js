'use strict';

const Campaigns = require('../../app/models/Campaign');

module.exports = function getCurrentCampaign() {
  return (req, res, next) => {
    if (req.campaign) {
      return next();
    }

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
