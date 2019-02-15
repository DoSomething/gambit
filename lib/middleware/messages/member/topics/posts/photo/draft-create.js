'use strict';

const helpers = require('../../../../../../helpers');

/**
 * This middleware creates a draftSubmission if one already doesn't exist, and the user has
 * submitted the start command.
 *
 * Moves user to first question by asking for quantity, or sends autoReply if start command
 * was not sent.
 */
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
      /**
       * Expose create draft submission errors in NewRelic.
       */
      return helpers.errorNoticeable.sendErrorResponse(res, err);
    }
  };
};
