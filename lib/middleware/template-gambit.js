'use strict';

const logger = require('heroku-logger');
const gambit = require('../gambit');

module.exports = function gambitTemplate() {
  return (req, res, next) => {
    logger.trace('gambitTemplate req.reply', req.reply);

    if (req.reply.template) {
      return next();
    }

    // If we sent a Signup or Continue message and got here -- it's because user didn't say NO.
    // Did they say yes?
    if (req.reply.brain === 'post_signup') {
      // Set the User Campaign.
      req.user.signupForCampaign(req.campaign, 'menu');
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
