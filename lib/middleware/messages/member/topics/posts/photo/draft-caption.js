'use strict';

const helpers = require('../../../../../../helpers');

const captionKey = 'caption';

module.exports = function draftCaption() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isPhotoPostConfig(req.topic)) {
        return next();
      }

      if (helpers.request.hasDraftSubmissionValue(req, captionKey)) {
        return next();
      }

      // TODO: Check valid message text.
      if (req.inboundMessageText) {
        await helpers.request.saveDraftSubmissionValue(req, captionKey, req.inboundMessageText);
        return await helpers.replies.askWhyParticipated(req, res);
      }

      return await helpers.replies.invalidCaption(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
