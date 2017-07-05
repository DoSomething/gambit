'use strict';

module.exports = function promptContinueCampaignTemplate() {
  return (req, res, next) => {
    if (req.reply.template) {
      return next();
    }

    const lastReply = req.user.lastReplyTemplate;

    // If the last reply Template was Gambit, our User is already talking about their Campaign.
    if (lastReply === 'gambit') {
      return next();
    }

    // If we made it here -- User said yes to the Signup so we'll want Gambit to handle.
    if (lastReply === 'askSignupMessage' || lastReply === 'invalidSignupResponseMessage') {
      return next();
    }

     // If we just asked them to continue and they said yes, exit to get reply from Gambit later.
    if (lastReply === 'askContinueMessage' && req.reply.brain === 'confirmedCampaign') {
      return next();
    }

    // Let's prompt User to continue chatting Gambit Campaigns.
    req.reply.template = 'askContinueMessage';

    // Topic may be set to random from the last Rivescript reply.
    // We set it to the Campaign topic to listen for confirmedCampaign or declinedCampaign macros.
    req.user.updateUserTopic(req.campaign.topic);

    return next();
  };
};
