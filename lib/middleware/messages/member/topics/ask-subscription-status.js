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

      if (helpers.request.isSubscriptionStatusActiveMacro(req)) {
        const saidActiveTopic = broadcastTopic.saidActiveTopic;
        if (!saidActiveTopic.id) {
          throw new UnprocessableEntityError('saidActiveTopic is undefined');
        }
        await helpers.request
          .executeInboundTopicChange(req, saidActiveTopic);
        return helpers.replies.sendReply(req, res, broadcastTopic.saidActive, req.macro);
      }

      if (helpers.request.isSubscriptionStatusLessMacro(req)) {
        const saidLessTopic = broadcastTopic.saidLessTopic;
        if (!saidLessTopic.id) {
          throw new UnprocessableEntityError('saidLessTopic is undefined');
        }
        await helpers.request
          .executeInboundTopicChange(req, saidLessTopic);
        return helpers.replies.sendReply(req, res, broadcastTopic.saidLess, req.macro);
      }

      if (helpers.request.isSubscriptionStatusNeedMoreInfoMacro(req)) {
        return helpers.replies.sendReply(req, res, broadcastTopic.saidNeedMoreInfo, req.macro);
      }

      if (helpers.request.isSubscriptionStatusStopMacro(req)) {
        // Change topic to hardcoded unsubscribed topic.
        await helpers.request
          .executeInboundTopicChange(req, helpers.topic.getUnsubscribedTopic());
        // Send hardcoded unsubscribe confirmation macro text.
        const macroConfig = helpers.macro.getMacro(req.macro);
        return helpers.replies.sendReply(req, res, macroConfig.text, req.macro);
      }

      return helpers.replies
        .sendReply(req, res, broadcastTopic.invalidAskSubscriptionStatusResponse, req.macro);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
