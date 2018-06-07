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
      // Check if this is a Campaign Keyword.
      const campaign = await gambitCampaigns.getCampaignByKeyword(keyword);
      if (!campaign) {
        logger.debug('No campaigns found for keyword', { keyword }, req);
        return next();
      }
      helpers.request.setCampaign(req, campaign);
      const topic = campaign.topics[0];
      // Inject a campaign property, as the nested topics data of a GET /campaigns/:id response
      // doesn't include a nested topic object.
      // This is kind of gross and not DRY per helpers.topic.fetchByCampaignId -- but this
      // middleware will be deprecated soon.
      topic.campaign = campaign;
      helpers.request.setTopic(req, topic);
      helpers.request.setKeyword(req, keyword);
      await req.conversation.changeTopic(topic);
      return helpers.replies.continueConversation(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
