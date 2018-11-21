'use strict';

const helpers = require('../../../../../../helpers');

module.exports = function draftCaption() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isPhotoPostConfig(req.topic)) {
        return next();
      }

      if (req.draftSubmission.values.caption) {
        return next();
      }

      // TODO: Check valid message text.
      if (req.inboundMessageText) {
        await req.draftSubmission.saveValues({ caption: req.inboundMessageText });
        return await helpers.replies.askWhyParticipated(req, res);
      }

      return await helpers.replies.invalidCaption(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
