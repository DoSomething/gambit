'use strict';

const Campaigns = require('../../../app/models/Campaign');

module.exports = function getCampaignForKeyword() {
  return (req, res, next) => {
    if (req.reply.template) {
      return next();
    }

    // Did User send a Campaign keyword?
    return Campaigns.findByKeyword(req.userCommand)
      .then((campaign) => {
        if (! campaign) {
          return next();
        }

        req.campaign = campaign;
        req.keyword = req.userCommand;
        // Gambit to handle the Confirmation/Continue reply.
        req.reply.template = 'gambit';

        return next();
      });
  };
};
