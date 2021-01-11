'use strict';

const helpers = require('../../../../../../helpers');

const key = helpers.topic.getPhotoPostDraftSubmissionValuesMap().hoursSpent;

module.exports = function draftHoursSent() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isPhotoPostConfig(req.topic)) {
        return next();
      }

      // TODO: Check if the topic action counts for volunteer credit.

      if (helpers.request.hasDraftSubmissionValue(req, key)) {
        return next();
      }

      // TODO: Cast as decimal?
      const hoursSpentValue = Number(req.inboundMessageText);

      if (hoursSpent) {
        await helpers.request.saveDraftSubmissionValue(req, key, hoursSpentValue);

        return await helpers.replies.askPhoto(req, res);
      }

      return await helpers.replies.invalidCaption(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
