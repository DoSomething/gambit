'use strict';

const helpers = require('../../../helpers');

module.exports = function validateCampaign() {
  return (req, res, next) => {
    if (!helpers.request.hasCampaign(req)) {
      return helpers.replies.noCampaign(req, res);
    }

    if (helpers.request.isClosedCampaign(req)) {
      return helpers.replies.campaignClosed(req, res);
    }
    return next();
  };
};
