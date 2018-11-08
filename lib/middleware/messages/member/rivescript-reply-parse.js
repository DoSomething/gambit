'use strict';

const helpers = require('../../../helpers');

module.exports = function parseRivescriptReply() {
  return async (req, res, next) => {
    // If a macro is set, we determine reply later.
    if (req.macro) {
      return next();
    }
    // Else send Rivescript reply.
    try {
      let newTopic = null;
      if (req.rivescriptReplyTopicId) {
        newTopic = await helpers.topic.getById(req.rivescriptReplyTopicId);
        await helpers.request
          .executeInboundTopicChange(req, newTopic, `keyword/${req.rivescriptMatch}`);
      }

      const templateName = newTopic ? helpers.topic
        .getTransitionTemplateName(newTopic) : 'quickReply';

      return await helpers.replies.sendReply(req, res, req.rivescriptReplyText, templateName);
    } catch (error) {
      return helpers.sendErrorResponse(res, error);
    }
  };
};
