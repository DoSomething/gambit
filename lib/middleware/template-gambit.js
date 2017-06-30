'use strict';

const logger = require('heroku-logger');
const gambit = require('../gambit');

module.exports = function getCampaignReply() {
  return (req, res, next) => {
    if (req.reply.template) {
      return next();
    }

    const lastReplyTemplate = req.user.lastReplyTemplate;
    logger.debug('getCampaignReply', { lastReplyTemplate, reply: req.reply });

    if (lastReplyTemplate === 'signupPromptMessage' || lastReplyTemplate === 'continuePromptMessage') {
      if (req.reply.brain === 'decline_signup') {
        req.user.declineSignup();
        req.reply.template = 'signupDeclinedMessage';

        return next();
      }

      if (req.reply.brain === 'post_signup') {
        req.user.signupForCampaign(req.campaign, 'menu');
        req.keyword = req.campaign.keywords[0];
      }

      else {
         // TODO: Look for prefix when its time to render the template.
        // req.reply.prefix = 'Sorry, I\'m not sure how to reply.\n\n';
        req.reply.template = req.user.lastReplyTemplate;
        return next();       
      }

    }

    if (process.env.DS_GAMBIT_DISABLED) {
      req.reply.text = req.reply.brain;

      return next();
    }

    // Bring user back to Campaign conversation.
    if (lastReplyTemplate === 'brain') {
      req.user.setCampaign(req.campaign);
      req.reply.template = 'continuePromptMessage';

      return next();
    }

    return gambit.getGambitReply(req.user._id, req.body.text, req.body.mediaUrl, req.keyword)
      .then((gambitReplyText) => {
        req.reply.template = 'gambit';
        req.reply.text = gambitReplyText;

        return next();
      })
      .catch(err => console.log(err));
  };
};
