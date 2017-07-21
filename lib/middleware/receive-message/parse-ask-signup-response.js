'use strict';

module.exports = function parseAskSignupResponse() {
  return (req, res, next) => {
    if (req.reply.template) {
      return next();
    }

    const lastReply = req.conversation.lastReplyTemplate;

    const askedForSignup = (lastReply === 'askSignupMessage' || lastReply === 'invalidSignupResponseMessage');
    if (! askedForSignup) {
      return next();
    }

    if (req.reply.brain === 'declinedCampaign') {
      req.conversation.declineSignup();
      req.reply.template = 'declinedSignupMessage';

      return next();
    }

    if (req.reply.brain === 'confirmedCampaign') {
      req.reply.template = 'gambit';

      return next();
    }

    req.reply.template = 'invalidSignupResponseMessage';

    return next();
  };
};
