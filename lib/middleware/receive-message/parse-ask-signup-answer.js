'use strict';

const helpers = require('../../helpers');

module.exports = function parseAskSignupResponse() {
  return (req, res, next) => {
    const template = req.conversation.lastOutboundTemplate;
    const asked = (template === 'askSignupMessage' || template === 'invalidSignupResponseMessage');
    if (!asked) {
      return next();
    }

    if (req.rivescriptReplyText === 'confirmedCampaign') {
      // Set this to trigger Campaign Doing Menu reply in Gambit Campaigns.
      req.keyword = 'confirmed';

      return helpers.continueCampaign(req, res);
    }

    if (req.rivescriptReplyText !== 'declinedCampaign') {
      return helpers.invalidSignupResponse(req, res);
    }

    return req.conversation.declineSignup()
      .then(() => helpers.declinedSignup(req, res))
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
