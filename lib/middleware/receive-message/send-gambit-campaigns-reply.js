'use strict';

const gambitCampaigns = require('../../gambit-campaigns');

module.exports = function gambitTemplate() {
  return (req, res, next) => {
    if (req.reply.template && req.reply.template !== 'gambit') {
      return next();
    }

    if (!req.campaign) {
      return next();
    }

    // If not SMS -- pass Conversation._id instead of our Conversation.userId (phone).
    let phone = req.conversation._id;
    if (req.conversation.medium === 'sms') {
      // TODO: rename to mediumUserId and update all instances of it.
      phone = req.conversation.userId;
    }
    const data = {
      phone,
      text: req.inboundMessageText,
      mediaUrl: req.mediaUrl,
      campaignId: req.campaign._id,
    };
    if (req.keyword) {
      data.keyword = req.keyword.toLowerCase();
    }
    return gambitCampaigns.postSignupMessage(data)
      .then((gambitReplyText) => {
        req.reply.template = 'gambit';
        req.reply.text = gambitReplyText;

        return next();
      })
      .catch((/* err */) => () => {
        // TODO console.log has to be replaced by other development logging library: Winston?
        // console.log(err)
      });
  };
};
