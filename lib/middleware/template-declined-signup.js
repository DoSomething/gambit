'use strict';

module.exports = function declinedSignupTemplate() {
  return (req, res, next) => {
    if (req.reply.template) {
      return next();
    }

    const declinedSignup = (req.user.lastReplyTemplate === 'askSignupMessage' && req.reply.brain === 'declinedCampaign');
    if (declinedSignup) {
      req.user.declineSignup();
      req.reply.template = 'signupDeclinedMessage';
    }

    return next();
  };
};
