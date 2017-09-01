'use strict';

const helpers = require('../../helpers');

module.exports = function parseAskSignupResponse() {
  return (req, res, next) => {
    const template = req.conversation.lastOutboundTemplate;
    const asked = (template === 'askSignupMessage' || template === 'invalidSignupResponseMessage');
    if (!asked) {
      return next();
    }

    const text = req.rivescriptReplyText;
    if (helpers.isConfirmedCampaignMacro(text)) {
      return helpers.confirmedSignup(req, res);
    }

    if (!helpers.isDeclinedCampaignMacro(text)) {
      return helpers.invalidSignupResponse(req, res);
    }

    return req.conversation.declineSignup()
      .then(() => helpers.declinedSignup(req, res))
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
