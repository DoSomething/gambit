'use strict';

const helpers = require('../../../helpers');

module.exports = function parseMacro() {
  return (req, res, next) => {
    try {
      if (!req.macro) {
        return req.conversation.setTopic(req.rivescriptReplyTopic)
          .then(() => helpers.replies.rivescriptReply(req, res, req.rivescriptReplyText))
          .catch(err => helpers.sendErrorResponse(res, err));
      }

      /**
       * Check for changeTopic macro.
       */
      if (helpers.request.isChangeTopicMacro(req)) {
        return helpers.request.executeChangeTopicMacro(req)
          .then(() => helpers.replies.continueTopic(req, res))
          .catch(err => helpers.sendErrorResponse(res, err));
      }

      /**
       * Check if this macro sends a hardcoded reply message.
       */
      const replyTemplate = helpers.macro.getReply(req.macro);
      if (!replyTemplate) {
        return next();
      }

      // TODO: If we refactor the changeTopicMacro to use Rivescript topic change syntax,
      // the execution of the changeTopicMacro above can move into this conditional.
      if (helpers.request.isTopicChange(req)) {
        return req.conversation.setTopic(req.rivescriptReplyTopic)
          .then(() => helpers.replies[replyTemplate](req, res))
          .catch(err => helpers.sendErrorResponse(res, err));
      }

      return helpers.replies[replyTemplate](req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
