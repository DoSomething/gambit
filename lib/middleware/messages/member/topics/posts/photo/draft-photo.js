'use strict';

const helpers = require('../../../../../../helpers');

/**
 * This middleware is step 2 of 4 for photo post creation: saving url to draft.
 *
 * Upon saving url to draft, moves to step 3 to ask for a caption.
 */
const urlKey = helpers.topic.getPhotoPostDraftSubmissionValuesMap().url;

module.exports = function draftPhoto() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isPhotoPostConfig(req.topic)) {
        return next();
      }

      if (helpers.request.hasDraftSubmissionValue(req, urlKey)) {
        return next();
      }

      if (req.mediaUrl) {
        await helpers.request.saveDraftSubmissionValue(req, urlKey, req.mediaUrl);
        return await helpers.replies.askCaption(req, res);
      }

      return await helpers.replies.invalidPhoto(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
