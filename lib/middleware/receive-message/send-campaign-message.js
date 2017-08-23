'use strict';

module.exports = function renderReplyText() {
  return (req, res, next) => {
    // If we haven't rendered text yet, this is a campaign message except for edge-case when our
    // template === noReply -- in that case our text is set to empty string.
    if (req.reply.text || req.reply.template === 'noReply') {
      return next();
    }

    if (req.campaign) {
      // This virtualProperty check will be deprecated once we add new Contentful fields.
      // @see https://github.com/DoSomething/gambit-conversations/issues/67
      const virtualProperty = req.campaign[req.reply.template];
      if (virtualProperty) {
        req.reply.text = virtualProperty;
      } else {
        req.reply.text = req.campaign.messages[req.reply.template];
      }
      if (req.reply.text) {
        return next();
      }
    }

    // TODO: Set this as a config variable.
    req.reply.template = 'noCampaignMessage';
    req.reply.text = 'Sorry, I\'m not sure how to respond to that.\n\nSay MENU to find a Campaign to join.';
    return next();
  };
};
