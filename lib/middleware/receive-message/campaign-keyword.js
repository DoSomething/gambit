'use strict';

const logger = require('heroku-logger');
const helpers = require('../../helpers');
const Campaigns = require('../../../app/models/Campaign');

module.exports = function getCampaignForKeyword() {
  return (req, res, next) => {
    const loggerMessage = 'getCampaignForKeyword';
    const keyword = req.userCommand;

    // Did User send a Campaign keyword?
    Campaigns.findByKeyword(keyword)
      .then((campaign) => {
        if (!campaign) {
          logger.debug(`${loggerMessage} not found`, { keyword });
          return next();
        }

        req.campaign = campaign;
        req.keyword = keyword;

        return req.conversation.setCampaign(campaign);
      })
      .catch(err => helpers.sendResponseForError(res, err));
  };
};
