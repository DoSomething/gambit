'use strict';

const helpers = require('../../../helpers');

module.exports = function replyMacro() {
  return async (req, res, next) => {
    try {
      const macro = helpers.macro.getMacro(req.macro);
      // Handles macros that send a hardcoded reply template.
      // If this isn't a macro that returns a hardcoded reply, move on to next middleware.
      if (!macro.text) {
        return next();
      }

      // TODO: If this is a votingPlanMethodOfTransport macro, we want to create a text post
      // from the values saved on the user's voting plan profile fields. This is a bit tricky as
      // this inbound message request could be a retry, but we don't want to create multiple
      // text posts for each retry. It'd be ideal if Rogue had a separate voting plan type that
      // would upsert for a given election year, instead of creating multiple voting plans.

      if (macro.topic && macro.topic.id) {
        // TODO: Rename as updateTopicIfChanged?
        await helpers.request.changeTopic(req, macro.topic);
      }
      return await helpers.replies.sendReply(req, res, macro.text, macro.name);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
