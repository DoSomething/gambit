'use strict';

const rivescript = require('../../rivescript.js');

module.exports = function getRivescriptReply() {
  return (req, res, next) => {
    rivescript.getReply(req.conversation, req.inboundMessageText)
      .then((rivescriptRes) => {
        req.reply = rivescriptRes;
        req.rivescriptReplyText = rivescriptRes.brain;

        return req.conversation.setTopic(rivescriptRes.topic);
      })
      .then(() => next())
      .catch(err => err);
  };
};
