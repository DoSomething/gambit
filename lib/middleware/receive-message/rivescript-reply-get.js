'use strict';

const logger = require('../../logger');
const helpers = require('../../helpers');
const rivescript = require('../../rivescript');

module.exports = function getRivescriptReply() {
  return (req, res, next) => {
    rivescript.getReply(req.conversation, req.inboundMessageText)
      .then((rivescriptRes) => {
        logger.debug('rivescript.getReply', rivescriptRes, req);
        const replyText = rivescriptRes.text;
        req.rivescriptReplyText = replyText;
        req.rivescriptMatch = rivescriptRes.match;
        req.rivescriptReplyTopic = rivescriptRes.topic;
        const isMacro = helpers.macro.isMacro(replyText);
        if (isMacro) {
          req.macro = replyText;
        }

        return next();
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
