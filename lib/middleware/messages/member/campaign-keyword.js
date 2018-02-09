'use strict';

const logger = require('../../../logger');
const helpers = require('../../../helpers');
const gambitCampaigns = require('../../../gambit-campaigns');

module.exports = function getCampaignForKeyword() {
  return (req, res, next) => {
    const keyword = helpers.request.parseCampaignKeyword(req);
    if (!keyword) {
      return next();
    }

    // Check if this is a Campaign Keyword.
    return gambitCampaigns.getCampaignByKeyword(keyword)
      .then((campaign) => {
        if (!campaign) {
          logger.debug('No campaigns found for keyword', { keyword }, req);
          return next();
        }
        req.campaign = campaign;
        req.keyword = keyword;

        return req.conversation.setCampaign(campaign)
          .then(() => {
            if (gambitCampaigns.isClosedCampaign(req.campaign)) {
              return helpers.replies.campaignClosed(req, res);
            }
            return helpers.replies.continueCampaign(req, res);
          });
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
