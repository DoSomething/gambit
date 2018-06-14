'use strict';

const helpers = require('../../../helpers');

module.exports = function sendMacroReply() {
  return (req, res, next) => {
    try {
      const macroReply = helpers.macro.getReply(req.macro);
      if (!macroReply) {
        return next();
      }

      if (req.conversation.topic !== req.rivescriptReplyTopic) {
        return req.conversation.setTopic(req.rivescriptReplyTopic)
          .then(() => helpers.replies[macroReply](req, res))
          .catch(err => helpers.sendErrorResponse(res, err));
      }

      return helpers.replies[macroReply](req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
