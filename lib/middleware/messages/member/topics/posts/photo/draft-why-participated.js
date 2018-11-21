'use strict';

const helpers = require('../../../../../../helpers');

module.exports = function draftWhyParticipated() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isPhotoPostConfig(req.topic)) {
        return next();
      }

      if (req.draftSubmission.values.whyParticipated) {
        return next();
      }

      if (req.inboundMessageText) {
        await req.draftSubmission.saveValues({ whyParticipated: req.inboundMessageText });
        return next();
      }

      return await helpers.replies.invalidWhyParticipated(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
