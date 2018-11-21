'use strict';

const helpers = require('../../../../../../helpers');

const whyParticipatedKey = 'whyParticipated';

module.exports = function draftWhyParticipated() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isPhotoPostConfig(req.topic)) {
        return next();
      }

      // TODO: Fetch signup from Rogue. If why_participated exists, we do not need to collect again.

      if (helpers.request.hasDraftSubmissionValue(req, whyParticipatedKey)) {
        return next();
      }

      // TODO: Check valid message text.
      if (req.inboundMessageText) {
        await helpers.request
          .saveDraftSubmissionValue(req, whyParticipatedKey, req.inboundMessageText);
        return next();
      }

      return await helpers.replies.invalidWhyParticipated(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
