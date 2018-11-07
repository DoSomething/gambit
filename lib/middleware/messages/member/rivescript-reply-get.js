'use strict';

const logger = require('../../../logger');
const helpers = require('../../../helpers');

module.exports = function getRivescriptReply() {
  return async (req, res, next) => {
    try {
      const rivescriptRes = await helpers.request.getRivescriptReply(req);

      if (helpers.request.isTwilioStudio(req)) {
        return helpers.response.sendData(res, { user: req.user, reply: rivescriptRes });
      }

      req.rivescriptMatch = rivescriptRes.match;
      req.rivescriptReplyText = rivescriptRes.text;
      req.rivescriptReplyTopicId = rivescriptRes.topicId;
      logger.debug('rivescript.getReply', { result: rivescriptRes }, req);

      if (helpers.macro.isMacro(req.rivescriptReplyText)) {
        helpers.request.setMacro(req, req.rivescriptReplyText);
      }
      return next();
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
