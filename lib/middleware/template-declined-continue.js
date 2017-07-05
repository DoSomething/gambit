'use strict';

module.exports = function declinedContinueTemplate() {
  return (req, res, next) => {
    if (req.reply.template) {
      return next();
    }

    const declinedContinue = (req.user.lastReplyTemplate === 'askContinueMessage' && req.reply.brain === 'declinedCampaign');
    if (declinedContinue) {
      req.reply.template = 'declinedContinueMessage';
    }

    return next();
  };
};
