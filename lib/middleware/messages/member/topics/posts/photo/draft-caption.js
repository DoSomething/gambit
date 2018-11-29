'use strict';

const helpers = require('../../../../../../helpers');

/**
 * This middleware is step 3 of 4 for photo post creation: saving caption to draft.
 *
 * Upon saving caption to draft, moves to step 4 to save or skip whyParticipated.
 */
const captionKey = helpers.topic.getPhotoPostDraftSubmissionValuesMap().caption;

module.exports = function draftCaption() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isPhotoPostConfig(req.topic)) {
        return next();
      }

      if (helpers.request.hasDraftSubmissionValue(req, captionKey)) {
        return next();
      }

      if (helpers.util.isValidTextFieldValue(req.inboundMessageText)) {
        await helpers.request.saveDraftSubmissionValue(req, captionKey, req.inboundMessageText);

        if (await helpers.request.hasSignupWithWhyParticipated(req)) {
          return next();
        }

        return await helpers.replies.askWhyParticipated(req, res);
      }

      return await helpers.replies.invalidCaption(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
