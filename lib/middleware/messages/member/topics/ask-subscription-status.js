'use strict';

const helpers = require('../../../../helpers');
const logger = require('../../../../logger');
const UnprocessableEntityError = require('../../../../../app/exceptions/UnprocessableEntityError');

module.exports = function catchAllAskSubscriptionStatus() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isAskSubscriptionStatus(req.topic)) {
        return next();
      }

      const broadcastTopic = req.topic;
      logger.debug('parsing askSubscriptionStatus response for broadcast topic', {
        id: broadcastTopic.id,
      });

      await helpers.request.parseAskSubscriptionStatusResponse(req);
      const templateName = req.macro;

      if (helpers.macro.isSubscriptionStatusActive(templateName)) {
        const saidActiveTopic = broadcastTopic.saidActiveTopic;
        if (!saidActiveTopic.id) {
          throw new UnprocessableEntityError('saidActiveTopic is undefined');
        }
        await helpers.request
          .executeInboundTopicChange(req, saidActiveTopic);
        return helpers.replies.sendReply(req, res, broadcastTopic.saidActive, templateName);
      }

      if (helpers.macro.isSubscriptionStatusLess(templateName)) {
        const saidLessTopic = broadcastTopic.saidLessTopic;
        if (!saidLessTopic.id) {
          throw new UnprocessableEntityError('saidLessTopic is undefined');
        }
        await helpers.request
          .executeInboundTopicChange(req, saidLessTopic);
        return helpers.replies.sendReply(req, res, broadcastTopic.saidLess, templateName);
      }

      return helpers.replies
        .sendReply(req, res, broadcastTopic[templateName], templateName);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
