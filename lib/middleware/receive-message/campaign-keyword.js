'use strict';

const logger = require('heroku-logger');
const helpers = require('../../helpers');
const Campaign = require('../../../app/models/Campaign');

module.exports = function getCampaignForKeyword() {
  return (req, res, next) => {
    const loggerMessage = 'getCampaignForKeyword';
    const keyword = req.userCommand;

    // Did User send a Campaign keyword?
    Campaign.findByKeyword(keyword)
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

        return helpers.continueCampaign(req, res);
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
