'use strict';

const logger = require('heroku-logger');

module.exports = function promptContinueCampaignTemplate() {
  return (req, res, next) => {
    if (req.reply.template) {
      return next();
    }

    const lastReplyTemplate = req.user.lastReplyTemplate;

    // If the last reply Template was Gambit, our User is already talking about their Campaign.
    if (lastReplyTemplate === 'gambit') {
      return next();
    }

    // If we made it here -- User didn't say NO to the SignupPrompt, we will handle it later.
    if (lastReplyTemplate === 'askSignupMessage') {
      return next();
    }

     // If we just asked them to continue and they said yes, exit to get reply from Gambit later.
    if (lastReplyTemplate === 'askContinueMessage' && req.reply.brain === 'confirmedCampaign') {
      return next();
    }

    // Let's prompt User to continue chatting Gambit Campaigns.
    logger.debug('askContinueMessage');
    req.reply.template = 'askContinueMessage';

    // Topic may be set to random from the last Rivescript reply.
    // We set it to the Campaign topic to listen for confirmedCampaign or declinedCampaign macros.
    req.user.updateUserTopic(req.campaign.topic);

    return next();
  };
};
