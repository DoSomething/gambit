'use strict';

const helpers = require('../../../../helpers');
const logger = require('../../../../logger');

module.exports = function catchAllTextPost() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isTextPostConfig(req.topic)) {
        return next();
      }

      if (!helpers.util.isValidTextPost(req.inboundMessageText)) {
        return helpers.replies.invalidText(req, res);
      }

      const campaign = req.topic.campaign;
      const textPostRes = await helpers.user.createTextPost(req.user, {
        campaignId: campaign.id,
        campaignRunId: campaign.currentCampaignRun.id,
        text: req.inboundMessageText,
        source: req.platform,
      });
      logger.debug('created post', { id: textPostRes.data.id }, req);

      return await helpers.replies.completedTextPost(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
