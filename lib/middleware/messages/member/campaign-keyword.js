'use strict';

const logger = require('../../../logger');
const helpers = require('../../../helpers');
const gambitCampaigns = require('../../../gambit-campaigns');

module.exports = function getCampaignForKeyword() {
  return async (req, res, next) => {
    try {
      const keyword = helpers.request.parseCampaignKeyword(req);
      if (!keyword) {
        return next();
      }
      const campaign = await gambitCampaigns.getCampaignByKeyword(keyword);
      if (!campaign) {
        logger.debug('No campaigns found for keyword', { keyword }, req);
        return next();
      }
      helpers.request.setKeyword(req, keyword);
      await helpers.request.changeTopicByCampaign(req, campaign);
      return helpers.replies.continueConversation(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
