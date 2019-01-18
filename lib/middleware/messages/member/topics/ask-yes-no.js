'use strict';

const helpers = require('../../../../helpers');
const logger = require('../../../../logger');
const UnprocessableEntityError = require('../../../../../app/exceptions/UnprocessableEntityError');

module.exports = function catchAllAskYesNo() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isAskYesNo(req.topic)) {
        return next();
      }

      const broadcastTopic = req.topic;
      logger.debug('parsing askYesNo response for broadcast topic', { id: broadcastTopic.id });
      const sourceDetails = `broadcast/${broadcastTopic.id}`;

      await helpers.request.parseAskYesNoResponse(req);

      if (helpers.request.isSaidYesMacro(req)) {
        const saidYesTopic = broadcastTopic.saidYesTopic;
        if (!saidYesTopic.id) {
          throw new UnprocessableEntityError('saidYesTopic is undefined');
        }
        await helpers.request
          .executeInboundTopicChange(req, saidYesTopic, sourceDetails);
        return helpers.replies.saidYes(req, res, broadcastTopic.saidYes);
      }

      if (helpers.request.isSaidNoMacro(req)) {
        const saidNoTopic = req.topic.saidNoTopic;
        if (!saidNoTopic.id) {
          throw new UnprocessableEntityError('saidNoTopic is undefined');
        }
        await helpers.request
          .executeInboundTopicChange(req, saidNoTopic, sourceDetails);
        return helpers.replies.saidNo(req, res, broadcastTopic.saidNo);
      }

      return helpers.replies.invalidAskYesNoResponse(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
