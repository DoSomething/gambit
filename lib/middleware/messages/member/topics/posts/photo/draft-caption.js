'use strict';

const helpers = require('../../../../../../helpers');

/**
 * This middleware is step 3 of 4 for photo post creation: saving caption to draft.
 * Calls next to handle step 4.
 */
const captionKey = 'caption';

module.exports = function draftCaption() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isPhotoPostConfig(req.topic)) {
        return next();
      }

      if (helpers.request.hasDraftSubmissionValue(req, captionKey)) {
        return next();
      }

      // TODO: Check valid message text.
      if (req.inboundMessageText) {
        await helpers.request.saveDraftSubmissionValue(req, captionKey, req.inboundMessageText);
        /**
         * After saving caption, the last field to submit is why participated, but we only want to
         * collect if it doesn't exist. The next middleware will check for this condition, but it
         * needs to know that this request was a successful save of the draft photo post caption.
         */
        req.savedPhotoPostCaption = true;
        return next();
      }

      return await helpers.replies.invalidCaption(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
