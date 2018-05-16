'use strict';

const helpers = require('../../../helpers');

module.exports = function sendMacroReply() {
  return (req, res, next) => {
    try {
      if (helpers.macro.isChangeTopic(req.macro)) {
        // TODO: This is temporary until we take on following steps:
        // Parse req.macro to find the contentful ID, which should have a campaign.
        // Update user topic to the contentful ID and forward message as campaignActivity.
        // This means checking Conversations for topic always, instead of campaignId property.
        return helpers.replies.noCampaign(req, res);
      }

      const macroReply = helpers.macro.getReply(req.macro);
      if (macroReply) {
        return helpers.replies[macroReply](req, res);
      }
      return next();
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
