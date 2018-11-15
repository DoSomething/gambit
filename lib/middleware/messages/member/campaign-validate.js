'use strict';

const helpers = require('../../../helpers');

module.exports = function validateCampaign() {
  return async (req, res, next) => {
    try {
      if (!helpers.request.hasCampaign(req)) {
        return await helpers.replies.noCampaign(req, res);
      }

      if (helpers.request.isClosedCampaign(req)) {
        return await helpers.replies.campaignClosed(req, res);
      }

      return next();
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
