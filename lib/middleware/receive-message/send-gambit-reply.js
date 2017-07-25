'use strict';

const gambitCampaigns = require('../../gambit-campaigns');

module.exports = function gambitTemplate() {
  return (req, res, next) => {
    if (req.reply.template && req.reply.template !== 'gambit') {
      return next();
    }

    if (! req.campaign) {
      return next();
    }

    // Passing Conversation._id as a hack for nwo to avoid Mobile Commons delivering messages to
    // phone numbers if when our medium is Twilio.
    const dummyPhone = req.conversation._id;
    return gambitCampaigns.getReply(dummyPhone, req.body.text, req.body.mediaUrl, req.keyword)
      .then((gambitReplyText) => {
        req.reply.template = 'gambit';
        req.reply.text = gambitReplyText;

        return next();
      })
      .catch(err => console.log(err));
  };
};
