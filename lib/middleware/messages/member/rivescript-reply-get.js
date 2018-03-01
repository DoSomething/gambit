'use strict';

const logger = require('../../../logger');
const helpers = require('../../../helpers');
const rivescript = require('../../../rivescript');

module.exports = function getRivescriptReply() {
  return (req, res, next) => rivescript.getReply(req.conversation, req.inboundMessageText)
    .then((rivescriptRes) => {
      const replyText = rivescriptRes.text;
      req.rivescriptReplyText = replyText;
      req.rivescriptMatch = rivescriptRes.match;
      req.rivescriptReplyTopic = rivescriptRes.topic;
      logger.debug('rivescript.getReply', { match: req.rivescriptMatch }, req);

      let isMacro;
      try {
        isMacro = helpers.macro.isMacro(replyText);
      } catch (err) {
        return helpers.sendErrorResponse(res, err);
      }

      if (isMacro) {
        req.macro = replyText;
      }

      return next();
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};
