'use strict';

const helpers = require('../../helpers');

module.exports = function parseAskContinueResponse() {
  return (req, res, next) => {
    const template = req.lastOutboundTemplate;
    const asked = (template === 'askContinueMessage' || template === 'invalidContinueResponseMessage');
    if (!asked) {
      return next();
    }

    const text = req.rivescriptReplyText;
    if (helpers.isConfirmedCampaignMacro(text)) {
      return helpers.confirmedContinue(req, res);
    }

    if (helpers.isDeclinedCampaignMacro(text)) {
      return helpers.declinedContinue(req, res);
    }

    return helpers.invalidContinueResponse(req, res);
  };
};
