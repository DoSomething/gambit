'use strict';

const logger = require('heroku-logger');
const helpers = require('../../helpers');
const gambitCampaigns = require('../../gambit-campaigns');

module.exports = function getCampaignForKeyword() {
  return (req, res, next) => {
    const loggerMessage = 'getCampaignForKeyword';
    const keyword = req.userCommand.toLowerCase();

    // Did User send a Campaign keyword?
    gambitCampaigns.getCampaignByKeyword(keyword)
      .then((campaign) => {
        if (!campaign) {
          logger.debug(`${loggerMessage} not found`, { keyword });
          return next();
        }
        req.campaign = campaign;
        req.keyword = keyword;

        return req.conversation.setCampaign(campaign)
          .then(() => {
            if (gambitCampaigns.isActiveCampaign(req.campaign)) {
              return helpers.continueCampaign(req, res);
            }
            return helpers.campaignClosed(req, res);
          });
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
