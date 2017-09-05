'use strict';

const helpers = require('../../helpers');

module.exports = function parseAskContinueResponse() {
  return (req, res, next) => {
    const asked = helpers.isAskContinueTemplate(req.lastOutboundTemplate);
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
