'use strict';

const helpers = require('../../../helpers');
const logger = require('../../../logger');

module.exports = function catchAllAskVotingPlanStatus() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isAskVotingPlanStatus(req.topic)) {
        return next();
      }

      logger.debug('parsing askVotingPlanStatus response for topic', { topicId: req.topic.id });
      await helpers.request.parseAskVotingPlanStatusResponse(req);
      const macroConfig = helpers.macro.getMacro(req.macro);

      if (helpers.macro.isInvalidVotingPlanStatus(req.macro)) {
        return await helpers.replies.sendReply(req, res, macroConfig.text, req.macro);
      }

      if (helpers.macro.isVotingPlanStatusVoting(req.macro)) {
        await helpers.request.changeTopic(req, macroConfig.topic);
        return await helpers.replies.sendReply(req, res, macroConfig.text, req.macro);
      }

      const reply = req.topic.templates[req.macro];
      await helpers.request.changeTopic(req, reply.topic);

      return await helpers.replies.sendReply(req, res, reply.text, req.macro);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
