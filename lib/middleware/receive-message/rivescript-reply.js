'use strict';

const rivescript = require('../../rivescript.js');

module.exports = function getRivescriptReply() {
  return (req, res, next) => {
    rivescript.getReply(req.conversation, req.inboundMessageText)
      .then((res) => {
        req.reply = res;
        req.rivescriptReplyText = res.brain;

        return req.conversation.setTopic(res.topic);
      })
      .then(() => next())
      .catch(err => err);
  };
};
