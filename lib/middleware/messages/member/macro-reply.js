'use strict';

const helpers = require('../../../helpers');

module.exports = function replyMacro() {
  return (req, res, next) => {
    let replyTemplate;

    try {
      // Handles macros that send a hardcoded reply template.
      // If this isn't a macro that returns a hardcoded reply, move on to next middleware.
      replyTemplate = helpers.macro.getReply(req.macro);
      if (!replyTemplate) {
        return next();
      }
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }

    return helpers.request.changeTopic(req, req.rivescriptReplyTopic)
      .then(() => helpers.replies[replyTemplate](req, res))
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
