'use strict';

const helpers = require('../../../helpers');
const logger = require('../../../logger');

module.exports = function parseRivescriptReply() {
  return async (req, res, next) => {
    // If a macro is set, we'll determine the reply later in macro middleware.
    if (req.macro) {
      return next();
    }

    const replyText = req.rivescriptReplyText;
    const replyTopicId = req.rivescriptReplyTopic;
    logger.debug('macro not found for', { replyText, replyTopicId });

    try {
      // If we're currently in a topic with templates:
      if (!helpers.topic.isRivescriptTopicId(req.currentTopicId)) {
        // And our Rivescript reply is for the default topic, we don't need a topic change. The
        // only times we update a conversation topic to default is via hardcoded Rivescript topics,
        // so we don't want to update user's topic to the default topic for these requests.
        if (helpers.topic.isDefaultTopicId(replyTopicId)) {
          return helpers.replies.rivescriptReply(req, res, replyText);
        }
      }

      const replyTopic = await helpers.topic.fetchById(replyTopicId.id);
      // TODO: Rename to something like updateTopicIfChanged.
      await helpers.request.changeTopic(req, replyTopic);

      if (req.isTopicChange) {
        if (replyTopic && replyTopic.campaign && replyTopic.campaign.id) {
          helpers.request.setKeyword(req, req.rivescriptMatch);
          /**
           * Note: we're posting campaignActivity after changing topic because postCampaignActiviy
           * expects a req.campaign, which we set via changeTopic. postCampaignActivity should be
           * refactored to accept an object of parameters, vs relying on variables injected into req
           */
          const campaignActivityRes = await helpers.request.postCampaignActivity(req);
          logger.debug('postCampaignActivity success', { campaignActivityRes });
        }
        return helpers.replies.sendReply(req, res, replyText, 'changeTopic');
      }

      return helpers.replies.rivescriptReply(req, res, replyText);
    } catch (error) {
      return helpers.sendErrorResponse(res, error);
    }
  };
};
