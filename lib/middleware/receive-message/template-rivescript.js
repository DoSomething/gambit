'use strict';

const helpers = require('../../helpers');

module.exports = function sendRivescriptReply() {
  return (req, res, next) => {
    if (helpers.macro.isMacro(req.rivescriptReplyText)) {
      return next();
    }

    return req.conversation.setTopic(req.rivescriptReplyTopic)
      .then(() => helpers.replies.rivescriptReply(req, res, req.rivescriptReplyText))
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
