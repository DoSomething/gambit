'use strict';

const helpers = require('../../../helpers');

module.exports = function replyMacro() {
  return async (req, res, next) => {
    try {
      const macro = helpers.macro.getMacro(req.macro);
      // reply with empty message
      if (helpers.macro.isNoReply(req.macro)) {
        return helpers.replies.noReply(req, res);
      }
      // If this isn't a macro that returns a hardcoded reply, move on to next middleware.
      if (!macro.text) {
        return next();
      }
      if (macro.topic && macro.topic.id) {
        await helpers.request.updateTopicIfChanged(req, macro.topic);
      }
      return helpers.replies.sendReply(req, res, macro.text, macro.name);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
