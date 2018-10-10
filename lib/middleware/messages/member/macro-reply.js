'use strict';

const helpers = require('../../../helpers');

module.exports = function replyMacro() {
  return async (req, res, next) => {
    try {
      const macro = helpers.macro.getMacro(req.macro);
      // If this isn't a macro that returns a hardcoded reply, move on to next middleware.
      if (!macro.text) {
        return next();
      }

      /**
       * TODO: If this is a votingPlanMethodOfTransport macro, we want to create a text post
       * from the values saved on the user's voting plan profile fields. We'll need to build
       * support into the POST campaignActivity to support a voting plan post, which will need
       * to check whether a text posts exists for the campaign, as we won't want to create
       * multiple voting plan posts upon retries.
       */

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
