'use strict';

const gambit = require('../gambit');

module.exports = function getCampaignReply() {
  return (req, res, next) => {
    if (req.reply.type) {
      return next();
    }
    console.log(req.reply);
    const lastReplyType = req.user.lastReplyType;
    if (lastReplyType === 'signupPromptMessage' || lastReplyType === 'continuePromptMessage') {
      if (req.reply.brain === 'decline_signup') {
        req.user.declineSignup();
        req.reply.type = 'signupDeclinedMessage';

        return next();
      }

      if (req.reply.brain === 'post_signup' ) {
        req.user.signupForCampaign(req.campaign, 'menu');
        req.keyword = req.campaign.keywords[0];
      }
      // else "Sorry I didn't get that", repeat our prompt message.
      console.log('sorry i didnt get that');
    }

    if (process.env.DS_GAMBIT_DISABLED) {
      req.reply.text = req.reply.brain;

      return next();
    }

    // Bring user back to Campaign conversation.
    if (lastReplyType === 'brain') {
      req.user.setCampaign(req.campaign);
      req.reply.type = 'continuePromptMessage';

      return next();
    }

    return gambit.getGambitReply(req.user._id, req.body.text, req.body.mediaUrl, req.keyword)
      .then((gambitReplyText) => {
        req.reply.type = 'gambit';
        req.reply.text = gambitReplyText;

        return next();
      })
      .catch(err => console.log(err));
  };
};
