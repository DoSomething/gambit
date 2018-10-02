'use strict';

const helpers = require('../../../helpers');
const logger = require('../../../logger');

module.exports = function replyMacro() {
  return async (req, res, next) => {
    try {
      // Handles macros that send a hardcoded reply template.
      // If this isn't a macro that returns a hardcoded reply, move on to next middleware.
      const macroReplyText = helpers.macro.getReplyText(req.macro);
      if (!macroReplyText) {
        return next();
      }
      logger.debug('macro macroReplyText', { macroReplyText });
      // TODO: Rename as updateTopicIfChanged?
      await helpers.request.changeTopic(req, req.rivescriptReplyTopic);
      return helpers.replies.sendReply(req, res, macroReplyText, req.macro);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
