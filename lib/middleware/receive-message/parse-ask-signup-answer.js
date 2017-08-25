'use strict';

module.exports = function parseAskSignupResponse() {
  return (req, res, next) => {
    const lastReply = req.conversation.lastOutboundTemplate;

    const askedForSignup = (lastReply === 'askSignupMessage' || lastReply === 'invalidSignupResponseMessage');
    if (!askedForSignup) {
      return next();
    }

    if (req.rivescriptReplyText === 'declinedCampaign') {
      req.conversation.declineSignup();
      req.reply.template = 'declinedSignupMessage';

      return next();
    }

    if (req.rivescriptReplyText === 'confirmedCampaign') {
      req.reply.template = 'gambit';

      return next();
    }

    req.reply.template = 'invalidSignupResponseMessage';

    return next();
  };
};
