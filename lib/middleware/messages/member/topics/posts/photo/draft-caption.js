'use strict';

const helpers = require('../../../../../../helpers');

/**
 * This middleware is step 3 of 4 for photo post creation: saving caption to draft.
 *
 * Upon saving caption to draft, moves to step 4 to save or skip whyParticipated.
 */
module.exports = function draftCaption(config) {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isPhotoPostConfig(req.topic)) {
        return next();
      }

      if (helpers.request.hasDraftSubmissionValue(req, config.draftValueKey)) {
        return next();
      }

      if (helpers.util.isValidTextFieldValue(req.inboundMessageText)) {
        await helpers.request
          .saveDraftSubmissionValue(req, config.draftValueKey, req.inboundMessageText);
        const hasWhyParticipated = await helpers.request.hasSignupWithWhyParticipated(req);
        if (hasWhyParticipated) {
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
