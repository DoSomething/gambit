'use strict';

const helpers = require('../../../helpers');

module.exports = function parseRivescriptReply() {
  return (req, res, next) => {
    if (req.macro) {
      return next();
    }
    // If a macro isn't defined, we send the Rivescript bot reply, but need to check for any
    // potential topic changes.
    const replyText = req.rivescriptReplyText;
    // If the current topic isn't hardcoded, we're here without a macro because the inbound
    // message triggered a quick reply.
    if (!helpers.topic.isHardcodedTopicId(req.conversation.topic)) {
      return helpers.replies.rivescriptReply(req, res, replyText);
    }
    // Don't save topic change if there isn't a need to.
    if (!helpers.request.isTopicChange(req)) {
      return helpers.replies.rivescriptReply(req, res, replyText);
    }
    return helpers.request.changeTopic(req.rivescriptReplyTopic)
      .then(() => helpers.replies.rivescriptReply(req, res, replyText))
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
