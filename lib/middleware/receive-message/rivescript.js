'use strict';

const helpers = require('../../helpers');
const rivescript = require('../../rivescript');

module.exports = function getRivescriptReply() {
  return (req, res, next) => {
    rivescript.getReply(req.conversation, req.inboundMessageText)
      .then((rivescriptRes) => {
        req.rivescriptReplyText = rivescriptRes.text;

        return req.conversation.setTopic(rivescriptRes.topic);
      })
      .then(() => {
        if (helpers.isMacro(req.rivescriptReplyText)) {
          return next();
        }

        return helpers.rivescriptReply(req, res, req.rivescriptReplyText);
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
