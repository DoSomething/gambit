'use strict';

const helpers = require('../../helpers');

module.exports = function parseAskContinueResponse() {
  return (req, res, next) => {
    const lastReply = req.lastOutboundTemplate;

    const askedForContinue = (lastReply === 'askContinueMessage' || lastReply === 'invalidContinueResponseMessage');
    if (!askedForContinue) {
      return next();
    }

    if (req.rivescriptReplyText === 'confirmedCampaign') {
      // Set this to include the "Picking up where you left off" prefix in Gambit Campaigns reply.
      req.keyword = 'continue';

      return helpers.continueCampaign(req, res);
    }

    const template = req.rivescriptReplyText === 'declinedCampaign' ? 'declinedContinueMessage' : 'invalidContinueResponseMessage';

    return helpers.sendReplyWithCampaignTemplate(req, res, template);
  };
};
