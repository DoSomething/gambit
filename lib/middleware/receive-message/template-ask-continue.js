'use strict';

module.exports = function askContinueTemplate() {
  return (req, res, next) => {
    if (req.reply.template) {
      return next();
    }

    // If the last reply Template was Gambit, our User is already talking about their Campaign.
    if (req.conversation.lastReplyTemplate === 'gambit') {
      return next();
    }

    if (! req.campaign) {
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
