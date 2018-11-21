'use strict';

const helpers = require('../../../../../../helpers');

module.exports = function draftQuantity() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isPhotoPostConfig(req.topic)) {
        return next();
      }

      if (req.draftSubmission.values.quantity) {
        return next();
      }

      const quantity = Number(req.inboundMessageText);
      if (quantity) {
        await req.draftSubmission.saveValues({ quantity });
        return await helpers.replies.askPhoto(req, res);
      }
      return await helpers.replies.invalidQuantity(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
