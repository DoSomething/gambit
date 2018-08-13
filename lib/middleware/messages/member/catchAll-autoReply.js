'use strict';

const helpers = require('../../../helpers');

module.exports = function catchAllAutoReply() {
  return async (req, res, next) => {
    try {
      if (!helpers.request.shouldSendAutoReply(req)) {
        return next();
      }

      if (helpers.request.hasCampaign(req)) {
        await helpers.request.postCampaignActivityFromReq(req);
      }

      return helpers.replies.autoReply(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
