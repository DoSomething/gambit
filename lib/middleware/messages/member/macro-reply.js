'use strict';

const helpers = require('../../../helpers');
const logger = require('../../../logger');

module.exports = function replyMacro() {
  return async (req, res, next) => {
    try {
      // Handles macros that send a hardcoded reply template.
      // If this isn't a macro that returns a hardcoded reply, move on to next middleware.
      const replyTemplate = helpers.macro.getReply(req.macro);
      if (!replyTemplate) {
        return next();
      }

      logger.debug('macro replyTemplate', { replyTemplate });
      // TODO: Rename as updateTopicIfChanged?
      await helpers.request.changeTopic(req, req.rivescriptReplyTopic);

      // Newer votingPlan macros define reply text in macro config instead of template config to DRY
      if (!helpers.replies[replyTemplate]) {
        return helpers.replies.sendReply(req, res, replyTemplate, req.macro);
      }

      return helpers.replies[replyTemplate](req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
