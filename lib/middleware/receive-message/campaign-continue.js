'use strict';

const helpers = require('../../helpers');

module.exports = function askContinueTemplate() {
  return (req, res, next) => {
    if (req.conversation.shouldPostToGambitCampaigns()) {
      return next();
    }

    // Topic may be set to random from the last Rivescript reply.
    // We set it to the Campaign topic to listen for confirmedCampaign, declinedCampaign macros.
    req.conversation.setTopic(req.campaign.topic);

    return helpers.sendReplyWithCampaignTemplate(req, res, 'askContinueMessage');
  };
};
