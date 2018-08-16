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
        return helpers.replies.saidNo(req, res);
      }

      // TODO: Send autoReply template if the last outbound template was a saidNo.
      return helpers.replies.invalidAskYesNoResponse(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
