'use strict';

const helpers = require('../../../helpers');
const logger = require('../../../logger');
const UnprocessableEntityError = require('../../../../app/exceptions/UnprocessableEntityError');

module.exports = function catchAllAskYesNo() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isAskYesNo(req.topic)) {
        return next();
      }

      const broadcastId = req.topic.id;
      logger.debug('parsing askYesNo response for topic', { topicId: broadcastId });
      const sourceDetails = `broadcast/${broadcastId}`;

      await helpers.request.parseAskYesNoResponse(req);

      if (helpers.request.isSaidYesMacro(req)) {
        const saidYesTemplate = req.topic.templates.saidYes;
        if (!saidYesTemplate.topic.id) {
          throw new UnprocessableEntityError('saidYes topic is undefined');
        }
        await helpers.request
          .executeInboundTopicChange(req, saidYesTemplate.topic, sourceDetails);
        return helpers.replies.saidYes(req, res, saidYesTemplate.text);
      }

      if (helpers.request.isSaidNoMacro(req)) {
        const saidNoTemplate = req.topic.templates.saidNo;
        if (!saidNoTemplate.topic.id) {
          throw new UnprocessableEntityError('saidNo topic is undefined');
        }
        await helpers.request
          .executeInboundTopicChange(req, saidNoTemplate.topic, sourceDetails);
        return helpers.replies.saidNo(req, res, saidNoTemplate.text);
      }

      return helpers.replies.invalidAskYesNoResponse(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
