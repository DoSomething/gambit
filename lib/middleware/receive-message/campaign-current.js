'use strict';

const logger = require('heroku-logger');
const helpers = require('../../helpers');
const Campaigns = require('../../../app/models/Campaign');

// TODO: Set these in config somewhere.
const template = 'noCampaignMessage';
const text = 'Sorry, I\'m not sure how to respond to that.\n\nSay MENU to find a Campaign to join.';

module.exports = function getCurrentCampaign() {
  return (req, res, next) => {
    // If we already have a Campaign, user sent a keyword.
    if (req.campaign) {
      return next();
    }

    const campaignId = req.conversation.campaignId;
    logger.debug('getCurrentCampaign', { campaignId });

    // If no Campaign has been set, User has never signed up for a Campaign.
    if (!campaignId) {
      return helpers.sendReply(req, res, text, template);
    }

    return Campaigns.findById(campaignId)
      .then((campaign) => {
        if (!campaign) {
          return helpers.sendReply(req, res, text, template);
        }

        req.campaign = campaign;

        return next();
      });
  };
};
