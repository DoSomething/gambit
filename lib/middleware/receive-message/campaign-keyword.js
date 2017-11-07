'use strict';

const logger = require('heroku-logger');
const helpers = require('../../helpers');
const gambitCampaigns = require('../../gambit-campaigns');

module.exports = function getCampaignForKeyword() {
  return (req, res, next) => {
    const loggerMessage = 'getCampaignForKeyword';
    let keyword = req.userCommand;
    if (!keyword) {
      return next();
    }

    keyword = keyword.toLowerCase();
    // Did User send a Campaign keyword?
    return gambitCampaigns.getCampaignByKeyword(keyword)
      .then((campaign) => {
        if (!campaign) {
          logger.debug(`${loggerMessage} not found`, { keyword });
          return next();
        }
        req.campaign = campaign;
        req.keyword = keyword;

        return req.conversation.setCampaign(campaign)
          .then(() => {
            if (gambitCampaigns.isClosedCampaign(req.campaign)) {
              return helpers.campaignClosed(req, res);
            }
            return helpers.continueCampaign(req, res);
          });
      })
      .catch(err => helpers.sendErrorResponse(req, res, err));
  };
};
