'use strict';

const helpers = require('../../../../../../helpers');

module.exports = function createDraftSubmission() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isPhotoPostConfig(req.topic)) {
        return next();
      }

      const draftSubmission = await helpers.request.getDraftSubmission(req);
      if (draftSubmission) {
        helpers.request.setDraftSubmission(req, draftSubmission);
        return next();
      }

      if (helpers.request.isStartCommand(req)) {
        await helpers.request.createDraftSubmission(req);
        return await helpers.replies.askQuantity(req, res);
      }

      return await helpers.replies.startPhotoPostAutoReply(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
