'use strict';

const gambit = require('../gambit');

module.exports = function getCampaignReply() {
  return (req, res, next) => {
    if (req.reply.type) {
      return next();
    }

    if (req.user.lastReplyType === 'signupPromptMessage') {
      if (req.reply.brain === 'decline_signup') {
        req.reply.type = 'signupDeclinedMessage';

        return next();
      } else if (req.reply.brain === 'post_signup') {
        req.user.signupForCampaign(req.campaign);
        req.keyword = req.campaign.keyword;
      }
      // else "Sorry I didn't get that", repeat our prompt message.
    }

    return gambit.getGambitReply(req.userId, req.body.text, req.keyword)
      .then((gambitReplyText) => {
        req.reply.type = 'gambit';
        req.reply.text = gambitReplyText;

        return next();
      })
      .catch(err => console.log(err));
  };
};
