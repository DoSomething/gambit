'use strict';

module.exports = function renderReplyText() {
  return (req, res, next) => {
    if (req.reply.text) {
      return next();
    }

    if (req.campaign) {
      req.reply.text = req.campaign[req.reply.template];

      return next();
    }

    // TODO: Set this as a config variable.
    req.reply.template = 'noCampaignMessage';
    req.reply.text = 'Sorry, I\'m not sure how to respond to that.\n\nSay MENU to find a Campaign to join.';
    return next();
  };
};
