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
       * Check if this is a macro that sends a hardcoded reply message template.
       */
      const replyTemplate = helpers.macro.getReply(req.macro);
      if (!replyTemplate) {
        return next();
      }

      /**
       * Checks if this macro call is changing the topic via Rivescript reply.
       */
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
