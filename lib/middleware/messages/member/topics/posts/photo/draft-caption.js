'use strict';

const helpers = require('../../../../../../helpers');

/**
 * Upon saving caption to draft, check whether to ask for hours spent or why participated.
 */
const captionKey = helpers.topic.getPhotoPostDraftSubmissionValuesMap().caption;

module.exports = function draftCaption() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isPhotoPostConfig(req.topic)) {
        return next();
      }

      if (helpers.request.hasDraftSubmissionValue(req, captionKey)) {
        return next();
      }

      if (helpers.util.isValidTextFieldValue(req.inboundMessageText)) {
        await helpers.request.saveDraftSubmissionValue(req, captionKey, req.inboundMessageText);

        if (helpers.topic.isVolunteerCredit(req.topic)) {
          return await helpers.replies.askHoursSpent(req, res);
        }

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
