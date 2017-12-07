'use strict';

const helpers = require('../../helpers');

module.exports = function parseAskSignupResponse() {
  return (req, res, next) => {
    const asked = helpers.template.isAskSignupTemplate(req.lastOutboundTemplate);
    if (!asked) {
      return next();
    }

    const text = req.macro;
    if (helpers.macro.isConfirmedCampaign(text)) {
      return helpers.replies.confirmedSignup(req, res);
    }

    if (!helpers.macro.isDeclinedCampaign(text)) {
      return helpers.replies.invalidAskSignupResponse(req, res);
    }

    return req.conversation.declineSignup()
      .then(() => helpers.replies.declinedSignup(req, res))
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
