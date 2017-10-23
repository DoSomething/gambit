'use strict';

const logger = require('heroku-logger');
const helpers = require('../../helpers');
const gambitCampaigns = require('../../gambit-campaigns');

module.exports = function getCampaignForKeyword() {
  return (req, res, next) => {
    const loggerMessage = 'getCampaignForKeyword';
    const keyword = req.userCommand;

    // Did User send a Campaign keyword?
    gambitCampaigns.getCampaignByKeyword(keyword)
      .then((campaign) => {
        if (!campaign) {
          logger.debug(`${loggerMessage} not found`, { keyword });
          return true;
        }

        req.campaign = campaign;
        req.keyword = keyword;

        return req.conversation.setCampaign(campaign);
      })
      .then(() => {
        if (!req.campaign) {
          return next();
        }

        if (req.campaign.isClosed) {
          return helpers.campaignClosed(req, res);
        }

        return helpers.continueCampaign(req, res);
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
