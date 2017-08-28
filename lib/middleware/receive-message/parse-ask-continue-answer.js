'use strict';

const helpers = require('../../helpers');

module.exports = function parseAskContinueResponse() {
  return (req, res, next) => {
    const lastReply = req.conversation.lastOutboundTemplate;

    const askedForContinue = (lastReply === 'askContinueMessage' || lastReply === 'invalidContinueResponseMessage');
    if (!askedForContinue) {
      return next();
    }

    if (req.rivescriptReplyText === 'confirmedCampaign') {
      req.reply.template = 'gambit';

      return next();
    }

    let template;
    if (req.rivescriptReplyText === 'declinedCampaign') {
      template = 'declinedContinueMessage';
    } else {
      template = 'invalidContinueResponseMessage';
    }

    return helpers.sendReplyWithCampaignTemplate(req, res, template);
  };
};
