'use strict';

const helpers = require('../../../../../../helpers');

module.exports = function catchAllPhotoPost() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isPhotoPostConfig(req.topic)) {
        return next();
      }

      const topicId = req.topic.id;
      const draftSubmission = await req.conversation.getDraftSubmission(topicId, { topicId });

      const inboundMessageText = req.inboundMessageText.toLowerCase();

      if (!draftSubmission) {
        if (inboundMessageText === 'start') {
          await req.conversation.createDraftSubmission(topicId);
          return await helpers.replies.askQuantity(req, res);
        }
        return await helpers.replies.startPhotoPostAutoReply(req, res);
      }

      req.draftSubmission = draftSubmission;
      if (!draftSubmission.values.quantity) {
        const quantity = Number(inboundMessageText);
        if (quantity) {
          await draftSubmission.saveValues({ quantity });
          return await helpers.replies.askPhoto(req, res);
        }
        return await helpers.replies.invalidQuantity(req, res);
      }

      if (!draftSubmission.values.url) {
        if (req.mediaUrl) {
          await draftSubmission.saveValues({ url: req.mediaUrl });
          return await helpers.replies.askWhyParticipated(req, res);
        }
        return await helpers.replies.invalidPhoto(req, res);
      }

      if (!draftSubmission.values.whyParticipated) {
        if (inboundMessageText) {
          await draftSubmission.saveValues({ whyParticipated: inboundMessageText });
          return next();
        }
        return await helpers.replies.invalidWhyParticipated(req, res);
      }

      return next();
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
