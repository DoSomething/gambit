'use strict';

const rivescript = require('../../rivescript.js');

module.exports = function getRivescriptReply() {
  return (req, res, next) => {
    rivescript.getReply(req.conversation, req.inboundMessageText)
      .then((reply) => {
        req.reply = reply;

        return req.conversation.setTopic(req.reply.topic);
      })
      .then(() => next())
      .catch(err => err);
  };
};
