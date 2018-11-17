'use strict';

const DraftSubmission = require('../../../../../../../app/models/DraftSubmission');
const helpers = require('../../../../../../helpers');
const logger = require('../../../../../../logger');

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
          // TODO: Send photo post to Rogue API.
          logger.debug('create photo post', draftSubmission.values, req);
          // Delete the draft, our submission is complete.
          await DraftSubmission.deleteOne({ _id: draftSubmission._id });
          return await helpers.replies.completedPhotoPost(req, res);
        }
        return await helpers.replies.invalidWhyParticipated(req, res);
      }

      logger.debug('create photo post', draftSubmission.values, req);
      // If we've made it this far, this is a retry.
      // TODO: Send photo post to Rogue API
      await DraftSubmission.deleteOne({ _id: draftSubmission._id });

      return await helpers.replies.completedPhotoPost(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
