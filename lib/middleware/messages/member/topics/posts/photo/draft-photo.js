'use strict';

const helpers = require('../../../../../../helpers');

/**
 * Upon saving url to draft, asks for a caption.
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
