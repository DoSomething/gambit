'use strict';

const helpers = require('../../../../helpers');
const logger = require('../../../../logger');

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
        await helpers.request
          .executeInboundTopicChange(req, broadcastTopic.saidActiveTopic);
        return helpers.replies.sendReply(req, res, broadcastTopic.saidActive, req.macro);
      }

      if (helpers.request.isSubscriptionStatusLessMacro(req)) {
        await helpers.request
          .executeInboundTopicChange(req, broadcastTopic.saidLessTopic);
        return helpers.replies.sendReply(req, res, broadcastTopic.saidLess, req.macro);
      }

      if (helpers.request.isSubscriptionStatusNeedMoreInfoMacro(req)) {
        return helpers.replies.sendReply(req, res, broadcastTopic.saidNeedMoreInfo, req.macro);
      }

      if (helpers.request.isSubscriptionStatusStopMacro(req)) {
        await helpers.request
          .executeInboundTopicChange(req, helpers.topic.getUnsubscribedTopic());
        // Send the hardcoded macro text.
        return helpers.replies
          .sendReply(req, res, helpers.macro.getMacro(req.macro).text, req.macro);
      }

      return helpers.replies
        .sendReply(req, res, broadcastTopic.invalidAskSubscriptionStatusResponse, req.macro);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
