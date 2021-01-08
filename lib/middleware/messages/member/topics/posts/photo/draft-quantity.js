'use strict';

const helpers = require('../../../../../../helpers');

/**
 * This middleware is step 1 of 4 for photo post creation: saving quantity to draft. We ask
 * this question first to ask them next for a photo, asking to prove they really did {{quantity}}.
 *
 * Upon saving quantity to draft, moves to step 2 to ask for a photo.
 */
const quantityKey = helpers.topic.getPhotoPostDraftSubmissionValuesMap().quantity;

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
