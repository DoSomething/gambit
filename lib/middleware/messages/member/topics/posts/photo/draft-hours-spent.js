'use strict';

const helpers = require('../../../../../../helpers');

const key = helpers.topic.getPhotoPostDraftSubmissionValuesMap().hoursSpent;

module.exports = function askHoursSent() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isPhotoPostConfig(req.topic)) {
        return next();
      }

      // TODO: Check if the topic action counts for volunteer credit.

      if (helpers.request.hasDraftSubmissionValue(req, key)) {
        return next();
      }

      if (helpers.util.isValidTextFieldValue(req.inboundMessageText)) {
        await helpers.request.saveDraftSubmissionValue(req, key, req.inboundMessageText);

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
