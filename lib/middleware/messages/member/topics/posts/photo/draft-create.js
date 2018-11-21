'use strict';

const helpers = require('../../../../../../helpers');

module.exports = function createDraft() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isPhotoPostConfig(req.topic)) {
        return next();
      }

      const topicId = req.topic.id;
      req.draftSubmission = await req.conversation.getDraftSubmission(topicId);

      if (req.draftSubmission) {
        return next();
      }

      if (req.inboundMessageText.trim().toLowerCase() === 'start') {
        await req.conversation.createDraftSubmission(topicId);
        return await helpers.replies.askQuantity(req, res);
      }

      return await helpers.replies.startPhotoPostAutoReply(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
