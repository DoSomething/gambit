'use strict';

module.exports = function askContinueTemplate() {
  return (req, res, next) => {
    if (req.reply.template) {
      return next();
    }

    // If lastOutboundTemplate is one of these, exit out of this middleware to post the inbound
    // message to Gambit Campaigns later. 
    const gambitCampaignsTemplates = ['gambit', 'externalSignupMenuMessage'];
    if (gambitCampaignsTemplates.includes(req.conversation.lastOutboundTemplate)) {
      return next();
    }

    if (!req.campaign) {
      return next();
    }

    // Let's prompt User to continue Gambit conversation for their current Campaign.
    req.reply.template = 'askContinueMessage';

    // Topic may be set to random from the last Rivescript reply.
    // We set it to the Campaign topic to listen for confirmedCampaign or declinedCampaign macros.
    req.conversation.setTopic(req.campaign.topic);

    return next();
  };
};
