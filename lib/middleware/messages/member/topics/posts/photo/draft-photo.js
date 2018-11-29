'use strict';

const helpers = require('../../../../../../helpers');

/**
 * This middleware is step 2 of 4 for photo post creation: saving url to draft.
 *
 * Upon saving url to draft, moves to step 3 to ask for a caption.
 */
module.exports = function draftPhoto(config) {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isPhotoPostConfig(req.topic)) {
        return next();
      }

      if (helpers.request.hasDraftSubmissionValue(req, config.draftValueKey)) {
        return next();
      }

      if (req.mediaUrl) {
        await helpers.request.saveDraftSubmissionValue(req, config.draftValueKey, req.mediaUrl);
        return await helpers.replies.askCaption(req, res);
      }

      return await helpers.replies.invalidPhoto(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
