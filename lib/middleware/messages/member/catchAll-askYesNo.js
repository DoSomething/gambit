'use strict';

const helpers = require('../../../helpers');
const logger = require('../../../logger');

module.exports = function catchAllAskYesNo() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isAskYesNo(req.topic)) {
        return next();
      }

      logger.debug('parsing askYesNo response for topic', { topicId: req.topic.id });
      await helpers.request.parseAskYesNoResponse(req);

      if (helpers.request.isSaidYesMacro(req)) {
        return helpers.request.executeSaidYesMacro(req, res)
          .catch(err => helpers.sendErrorResponse(res, err));
      }

      if (helpers.request.isSaidNoMacro(req)) {
        return helpers.request.executeSaidNoMacro(req, res)
          .catch(err => helpers.sendErrorResponse(res, err));
      }

      // If we're still in this topic and the inbound is neither a yes or no, re-prompt for another
      // yes no response.
      return helpers.replies.invalidAskYesNoResponse(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
