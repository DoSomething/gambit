'use strict';

const DraftSubmission = require('../../../../../app/models/DraftSubmission');
const helpers = require('../../../../helpers');
const logger = require('../../../../logger');

module.exports = function catchAllPhotoPost() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isPhotoPostConfig(req.topic)) {
        return next();
      }

      if (!process.env.DS_GAMBIT_CONVERSATIONS_DRAFT_SUBMISSIONS_ENABLED) {
        const photoPostRes = await helpers.request.postCampaignActivity(req);
        logger.debug('photoPostRes response', photoPostRes, req);

        return await helpers.replies
          .sendReplyWithTopicTemplate(req, res, photoPostRes.replyTemplate);
      }

      const topicId = req.topic.id;
      const draftSubmission = await DraftSubmission.findOne({
        conversationId: req.conversation.id,
        topicId,
      });

      const inboundMessageText = req.inboundMessageText.toLowerCase();
      // If there's no draft, we're waiting for user to send the start command.
      if (!draftSubmission) {
        logger.debug('draft not found for topic', { topicId }, req);
        if (inboundMessageText === 'start') {
          const newDraft = await DraftSubmission.create({
            conversationId: req.conversation.id,
            topicId,
            data: {},
          });
          logger.debug('created new draft', newDraft.id);
          return await helpers.replies.askQuantity(req, res);
        }
        return await helpers.replies.startPhotoPostAutoReply(req, res);
      }

      const draftId = draftSubmission.id;

      // Delete the draft, our submission is complete.
      logger.debug('Deleting draft', { draftId });
      await DraftSubmission.deleteOne({ _id: draftId });

      return await helpers.replies.completedPhotoPost(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
