'use strict';

const helpers = require('../../helpers');

module.exports = function parseAskSignupResponse() {
  return (req, res, next) => {
    const lastReply = req.conversation.lastOutboundTemplate;

    const askedForSignup = (lastReply === 'askSignupMessage' || lastReply === 'invalidSignupResponseMessage');
    if (!askedForSignup) {
      return next();
    }

    if (req.rivescriptReplyText === 'confirmedCampaign') {
      // Set this to trigger Campaign Doing Menu reply in Gambit Campaigns.
      req.keyword = 'confirmed';

      return helpers.continueCampaign(req, res);
    }

    let template;
    if (req.rivescriptReplyText === 'declinedCampaign') {
      req.conversation.declineSignup();
      template = 'declinedSignupMessage';
    } else {
      template = 'invalidSignupResponseMessage';
    }

    return helpers.sendReplyWithCampaignTemplate(req, res, template);
  };
};
