'use strict';

const helpers = require('../../../helpers');

module.exports = function parseMacro() {
  return (req, res, next) => {
    /**
     * Check for changeTopic macro.
     */
    let replyTemplate;
    try {
      if (helpers.request.isChangeTopicMacro(req)) {
        return helpers.request.executeChangeTopicMacro(req)
          .then(() => helpers.replies.continueTopic(req, res))
          .catch(err => helpers.sendErrorResponse(res, err));
      }

      // If this isn't a macro that returns a hardcoded reply, move on to next middleware.
      replyTemplate = helpers.macro.getReply(req.macro);
      if (!replyTemplate) {
        return next();
      }

      /**
       * Some of our hardcoded Rivescript sends a macro reply, but a topic change as well.
       * @see brain/topics/ask_subscription_status.rive
       */
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
