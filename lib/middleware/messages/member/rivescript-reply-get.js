'use strict';

const logger = require('../../../logger');
const helpers = require('../../../helpers');

module.exports = function getRivescriptReply() {
  return (req, res, next) => helpers.request.getRivescriptReply(req)
    .then((rivescriptRes) => {
      req.rivescriptReplyText = rivescriptRes.text;
      req.rivescriptMatch = rivescriptRes.match;
      req.rivescriptReplyTopic = rivescriptRes.topic;
      logger.debug('rivescript.getReply', { match: req.rivescriptMatch }, req);

      if (helpers.macro.isMacro(req.rivescriptReplyText)) {
        helpers.request.setMacro(req, req.rivescriptReplyText);
      }

      return next();
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};
