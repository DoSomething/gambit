'use strict';

const helpers = require('../../helpers');

module.exports = function parseAskSignupResponse() {
  return (req, res, next) => {
    const asked = helpers.isAskSignupTemplate(req.lastOutboundTemplate);
    if (!asked) {
      return next();
    }

    const text = req.rivescriptReplyText;
    if (helpers.isConfirmedCampaignMacro(text)) {
      return helpers.replies.confirmedSignup(req, res);
    }

    if (!helpers.isDeclinedCampaignMacro(text)) {
      return helpers.replies.invalidAskSignupResponse(req, res);
    }

    return req.conversation.declineSignup()
      .then(() => helpers.replies.declinedSignup(req, res))
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
