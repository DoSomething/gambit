'use strict';

const helpers = require('../../../helpers');

module.exports = function macroReply() {
  return (req, res, next) => {
    let replyTemplate;

    try {
      // Handles macros that send a hardcoded reply template.
      // If this isn't a macro that returns a hardcoded reply, move on to next middleware.
      replyTemplate = helpers.macro.getReply(req.macro);
      if (!replyTemplate) {
        return next();
      }
      // Some of our hardcoded Rivescript reply with a macro and Rivescript topic change syntax.
      // @see brain/topics/ask_subscription_status.rive
      if (!helpers.request.isTopicChange(req)) {
        return helpers.replies[replyTemplate](req, res);
      }
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }

    return req.conversation.setTopic(req.rivescriptReplyTopic)
      .then(() => helpers.replies[replyTemplate](req, res))
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
