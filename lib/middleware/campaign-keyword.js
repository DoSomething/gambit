'use strict';

const Campaigns = require('../../app/models/Campaign');

module.exports = function getCampaignForKeyword() {
  return (req, res, next) => {
    if (req.reply.template) {
      return next();
    }

    return Campaigns.findByKeyword(req.userCommand)
      .then((campaign) => {
        if (! campaign) {
          return next();
        }

        req.campaign = campaign;
        req.keyword = req.userCommand;

        return next();
      });
  };
};
