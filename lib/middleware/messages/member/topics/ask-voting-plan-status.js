'use strict';

const helpers = require('../../../../helpers');
const logger = require('../../../../logger');

module.exports = function catchAllAskVotingPlanStatus() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isAskVotingPlanStatus(req.topic)) {
        return next();
      }

      const broadcastTopic = req.topic;
      logger.debug('parsing askVotingPlanStatus response for topic', { topicId: req.topic.id });

      await helpers.request.parseAskVotingPlanStatusResponse(req);

      if (helpers.request.isVotingPlanStatusCantVoteMacro(req)) {
        await helpers.request.updateTopicIfChanged(req, broadcastTopic.saidCantVoteTopic);
        return helpers.replies.sendReply(req, res, broadcastTopic.saidCantVote, req.macro);
      }

      if (helpers.request.isVotingPlanStatusNotVotingMacro(req)) {
        await helpers.request.updateTopicIfChanged(req, broadcastTopic.saidNotVotingTopic);
        return helpers.replies.sendReply(req, res, broadcastTopic.saidNotVoting, req.macro);
      }

      if (helpers.request.isVotingPlanStatusVotedMacro(req)) {
        await helpers.request.updateTopicIfChanged(req, broadcastTopic.saidVotedTopic);
        return helpers.replies.sendReply(req, res, broadcastTopic.saidVoted, req.macro);
      }

      // If we've made it this far, this macro reply is hardcoded.
      const macroConfig = helpers.macro.getMacro(req.macro);

      if (macroConfig.topic) {
        await helpers.request.updateTopicIfChanged(req, macroConfig.topic);
      }

      return helpers.replies.sendReply(req, res, macroConfig.text, req.macro);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
