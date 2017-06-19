'use strict';

module.exports = function getReply() {
  return (req, res, next) => {
    return req.bot.replyAsync(req.user._id, req.body.message)
      .then((botReplyMessage) => {
        req.botReplyMessage = botReplyMessage;

        return next();
      })
      .catch(err => err);
  };
};
