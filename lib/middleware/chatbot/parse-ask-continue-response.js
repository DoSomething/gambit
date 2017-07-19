'use strict';

module.exports = function parseAskContinueResponse() {
  return (req, res, next) => {
    if (req.reply.template) {
      return next();
    }

    const lastReply = req.user.lastReplyTemplate;

    const askedForContinue = (lastReply === 'askContinueMessage' || lastReply === 'invalidContinueResponseMessage');
    if (! askedForContinue) {
      return next();
    }

    if (req.reply.brain === 'declinedCampaign') {
      req.reply.template = 'declinedContinueMessage';

      return next();
    }

    if (req.reply.brain === 'confirmedCampaign') {
      req.reply.template = 'gambit';

      return next();
    }

    req.reply.template = 'invalidContinueResponseMessage';

    return next();
  };
};
