'use strict';

const helpers = require('../../../../../../helpers');

const quantityKey = 'quantity';

module.exports = function draftQuantity() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isPhotoPostConfig(req.topic)) {
        return next();
      }

      if (helpers.request.hasDraftSubmissionValue(req, quantityKey)) {
        return next();
      }

      const quantity = Number(req.inboundMessageText);
      if (quantity) {
        await helpers.request.saveDraftSubmissionValue(req, quantityKey, quantity);
        return await helpers.replies.askPhoto(req, res);
      }
      return await helpers.replies.invalidQuantity(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
