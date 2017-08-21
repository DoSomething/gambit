'use strict';

module.exports = function askContinueTemplate() {
  return (req, res, next) => {
    if (req.reply.template) {
      return next();
    }

    if (req.conversation.shouldPostToGambitCampaigns()) {
      return next();
    }

    if (!req.campaign) {
      return next();
    }

    // Let's prompt User to continue the Signup conversation for their current Campaign.
    req.reply.template = 'askContinueMessage';

    // Topic may be set to random from the last Rivescript reply.
    // We set it to the Campaign topic to listen for confirmedCampaign, declinedCampaign macros.
    req.conversation.setTopic(req.campaign.topic);

    return next();
  };
};
