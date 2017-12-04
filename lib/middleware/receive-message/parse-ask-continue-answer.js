'use strict';

const helpers = require('../../helpers');

module.exports = function parseAskContinueResponse() {
  return (req, res, next) => {
    const asked = helpers.template.isAskContinueTemplate(req.lastOutboundTemplate);
    if (!asked) {
      return next();
    }

    const text = req.rivescriptReplyText;
    if (helpers.macro.isConfirmedCampaign(text)) {
      return helpers.replies.confirmedContinue(req, res);
    }

    if (helpers.macro.isDeclinedCampaign(text)) {
      return helpers.replies.declinedContinue(req, res);
    }

    return helpers.replies.invalidAskContinueResponse(req, res);
  };
};
