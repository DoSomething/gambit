'use strict';

const helpers = require('../../helpers');

module.exports = function parseAskContinueResponse() {
  return (req, res, next) => {
    const template = req.lastOutboundTemplate;
    const asked = (template === 'askContinueMessage' || template === 'invalidContinueResponseMessage');
    if (!asked) {
      return next();
    }

    if (req.rivescriptReplyText === 'confirmedCampaign') {
      // Set this to include the "Picking up where you left off" prefix in Gambit Campaigns reply.
      req.keyword = 'continue';

      return helpers.continueCampaign(req, res);
    }

    if (req.rivescriptReplyText === 'declinedCampaign') {
      return helpers.declinedContinue(req, res);
    }

    return helpers.invalidContinueResponse(req, res);
  };
};
