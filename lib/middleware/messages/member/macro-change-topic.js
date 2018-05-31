'use strict';

const helpers = require('../../../helpers');

module.exports = function changeTopicMacro() {
  return (req, res, next) => {
    try {
      if (!helpers.request.isTopicChange(req)) {
        return next();
      }

      return helpers.request.changeTopic(req)
        .then(() => {
          if (!req.campaign) {
            return helpers.replies.noCampaign(req, res);
          }
          if (helpers.request.isClosedCampaign(req)) {
            return helpers.replies.campaignClosed(req, res);
          }
          return helpers.replies.continueCampaign(req, res);
        })
        .catch(err => helpers.sendErrorResponse(res, err));
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
