'use strict';

const helpers = require('../../../../../../helpers');

module.exports = function draftQuantity() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isPhotoPostConfig(req.topic)) {
        return next();
      }

      if (req.draftSubmission.values.url) {
        return next();
      }

      if (req.mediaUrl) {
        await req.draftSubmission.saveValues({ url: req.mediaUrl });
        return await helpers.replies.askCaption(req, res);
      }

      return await helpers.replies.invalidPhoto(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
