'use strict';

const helpers = require('../../../helpers');

module.exports = function sendMacroReply() {
  return (req, res, next) => {
    try {
      if (helpers.request.isTopicChange(req)) {
        return helpers.request.changeTopic(req).then(() => {
          if (!req.campaign) {
            return helpers.replies.noCampaign(req, res);
          }
          if (helpers.request.isClosedCampaign(req)) {
            return helpers.replies.campaignClosed(req, res);
          }
          return helpers.replies.continueCampaign(req, res);
        });
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
