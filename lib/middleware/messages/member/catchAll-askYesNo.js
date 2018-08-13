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
        const saidYesTemplate = req.topic.templates.saidYes;
        await helpers.request.changeTopic(req, saidYesTemplate.topic);
        return helpers.replies.sendReply(req, res, saidYesTemplate.text, 'saidYes');
      }

      if (helpers.request.isSaidNoMacro(req)) {
        return helpers.replies.saidNo(req, res);
      }

      return helpers.replies.invalidAskYesNoResponse(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
