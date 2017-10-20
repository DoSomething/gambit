'use strict';

const helpers = require('../../helpers');

module.exports = function sendRivescriptReply() {
  return (req, res, next) => {
    if (helpers.isMacro(req.rivescriptReplyText)) {
      return next();
    }

    return req.conversation.setTopic(req.rivescriptReplyTopic)
      .then(() => helpers.rivescriptReply(req, res, req.rivescriptReplyText))
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
