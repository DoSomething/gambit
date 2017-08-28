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
      return req.conversation.setCampaign(req.campaign).then(() => next());
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
