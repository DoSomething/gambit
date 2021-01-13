'use strict';

const helpers = require('../../../../../../helpers');

/**
 * Upon saving hours spent to draft, check whether to ask for why participated.
 */
const hoursSpentKey = helpers.topic.getPhotoPostDraftSubmissionValuesMap().hoursSpent;

module.exports = function draftHoursSent() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isPhotoPostConfig(req.topic)) {
        return next();
      }

      // If this action is not volunteer credit, no need to collect hours spent.
      if (!helpers.topic.isVolunteerCredit(req.topic)) {
        return next();
      }

      if (helpers.request.hasDraftSubmissionValue(req, hoursSpentKey)) {
        return next();
      }

      const hoursSpentValue = Number(req.inboundMessageText);

      if (!hoursSpentValue) {
        return await helpers.replies.invalidHoursSpent(req, res);
      }

      await helpers.request.saveDraftSubmissionValue(req, hoursSpentKey, hoursSpentValue);

      if (await helpers.request.hasSignupWithWhyParticipated(req)) {
        return next();
      }

      return await helpers.replies.askWhyParticipated(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
