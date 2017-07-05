'use strict';

module.exports = function parseAskSignupResponse() {
  return (req, res, next) => {
    if (req.reply.template) {
      return next();
    }

    const lastReply = req.user.lastReplyTemplate;

    const askedForSignup = (lastReply === 'askSignupMessage' || lastReply === 'invalidSignupResponseMessage');
    if (! askedForSignup) {
      return next();
    }

    if (req.reply.brain === 'declinedCampaign') {
      req.user.declineSignup();
      req.reply.template = 'declinedSignupMessage';

      return next();
    }

    // If they didn't say Yes, send back a "I didn't understand that".
    if (req.reply.brain !== 'confirmedCampaign') {
      req.reply.template = 'invalidSignupResponseMessage';

      return next();
    }

    return next();
  };
};
