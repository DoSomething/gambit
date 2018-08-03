'use strict';

const helpers = require('../../../helpers');
const logger = require('../../../logger');

module.exports = function parseRivescriptReply() {
  return (req, res, next) => {
    // If a macro is set, we'll determine the reply later in macro middleware.
    if (req.macro) {
      return next();
    }

    const replyText = req.rivescriptReplyText;
    const replyTopic = req.rivescriptReplyTopic;
    logger.debug('macro not found for', { replyText, replyTopic });

    // If we're currently in a topic with templates:
    if (!helpers.request.isRivescriptCurrentTopic(req)) {
      // And our Rivescript reply is for the default topic, we don't need a topic change. The
      // only times we update a conversation topic to default is via hardcoded Rivescript topics,
      // so we don't want to update user's topic to the default topic for these requests.
      if (helpers.topic.isDefaultTopicId(replyTopic.id)) {
        return helpers.replies.rivescriptReply(req, res, replyText);
      }
    }

    return helpers.request.changeTopic(req, replyTopic)
      .then(() => helpers.replies.rivescriptReply(req, res, replyText))
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
