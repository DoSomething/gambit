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
      if (req.rivescriptReplyTopicId) {
        await helpers.request.executeRivescriptTopicChange(req);
      }
      const templateName = req.rivescriptReplyTopicId ? 'changeTopic' : 'quickReply';
      return await helpers.replies.sendReply(req, res, req.rivescriptReplyText, templateName);
    } catch (error) {
      return helpers.sendErrorResponse(res, error);
    }
  };
};
