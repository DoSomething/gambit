'use strict';

const Campaigns = require('../../../app/models/Campaign');

module.exports = function getCampaignForKeyword() {
  return (req, res, next) => {
    // Did User send a Campaign keyword?
    Campaigns.findByKeyword(req.userCommand)
      .then((campaign) => {
        if (!campaign) {
          return next();
        }

        req.campaign = campaign;
        req.keyword = req.userCommand;

        return next();
      });
  };
};
